const express = require('express');
const router = express.Router();

// Try known model paths via module-alias (~ points to /api)
let Agent;
try {
  Agent = require('~/models/Agent');
} catch (e1) {
  try {
    Agent = require('~/models/agent');
  } catch (e2) {
    console.error('[public/agents] Failed to load Agent model from ~/models/{Agent|agent}', e2);
  }
}

/** Strict whitelist of safe fields for public cards */
const sanitize = (a = {}) => ({
  id: a._id?.toString?.() ?? a.id,
  name: a.name,
  description: a.description ?? a.shortDescription ?? '',
  avatarUrl: a.avatarUrl ?? a.avatar ?? '',
  category: a.category ?? 'General',
  tags: Array.isArray(a.tags) ? a.tags : [],
  promoted: Boolean(a.promoted || a.featured),
  updatedAt: a.updatedAt ?? null,
});

/** Predicate for “public/marketplace-visible” agents.
 * 🔧 TODO: after debugging, replace with your REAL visibility flag, e.g.:
 *   const publicPredicate = { 'permissions.visibility': 'public' };
 */
const publicPredicate = {
  $or: [
    { 'permissions.visibility': 'public' },
    { 'sharing.visibility': 'public' },
    { 'marketplaceVisibility': 'public' },
    { visibility: 'public' },
    { isPublic: true },
    { public: true },
  ],
};

// ---- Optional soft rate limiter (per-IP, 60 req / 60s) ----
const hits = new Map();
function rateLimit(req, res, next) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 60;

  const entry = hits.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > windowMs) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  hits.set(ip, entry);

  if (entry.count > max) {
    return res.status(429).json({ error: 'Too Many Requests' });
  }
  return next();
}
// router.use(rateLimit);
// -----------------------------------------------------------

/* ============================
   DEBUG ROUTES (temporary)
   ============================ */

// Is model present + quick sample (sanitized)
router.get('/_debug', async (_req, res) => {
  try {
    if (!Agent) return res.status(500).json({ ok: false, error: 'Agent model not available' });
    const count = await Agent.countDocuments({});
    const one = await Agent.findOne({}, { _id: 1, name: 1, category: 1, updatedAt: 1 }).lean();
    return res.json({ ok: true, count, sample: one ? sanitize(one) : null });
  } catch (e) {
    console.error('[public/agents/_debug] error:', e);
    return res.status(500).json({ ok: false, error: 'debug_failed' });
  }
});

// Show top-level keys of a sample doc (to find your real visibility field)
router.get('/_schema', async (_req, res) => {
  try {
    if (!Agent) return res.status(500).json({ ok: false, error: 'Agent model not available' });
    const one = await Agent.findOne({}).lean();
    const keys = one ? Object.keys(one) : [];
    return res.json({ ok: true, keys });
  } catch (e) {
    console.error('[public/agents/_schema] error:', e);
    return res.status(500).json({ ok: false, error: 'schema_failed' });
  }
});

/* ============================
   REAL HANDLERS
   ============================ */

/** GET /api/public/agents
 *  Query: q, category, limit (<=200), offset
 */
router.get('/', async (req, res) => {
  try {
    if (!Agent) return res.status(500).json({ error: 'Agent model not available' });

    const q = String(req.query.q || '').trim();
    const category = req.query.category ? String(req.query.category) : undefined;
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

    // While validating, you can set PUBLIC_AGENTS_DEBUG_ALL=1 in Railway to bypass the predicate
    const forceAll = process.env.PUBLIC_AGENTS_DEBUG_ALL === '1';

    const and = [];
    if (!forceAll) and.push(publicPredicate);

    if (category && category !== 'all' && category !== 'promoted') {
      and.push({ category });
    } else if (category === 'promoted') {
      and.push({ $or: [{ promoted: true }, { featured: true }] });
    }

    if (q) {
      and.push({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { shortDescription: { $regex: q, $options: 'i' } },
        ],
      });
    }

    const predicate = and.length ? { $and: and } : {};

    const projection = {
      name: 1,
      description: 1,
      shortDescription: 1,
      avatarUrl: 1,
      avatar: 1,
      category: 1,
      tags: 1,
      promoted: 1,
      featured: 1,
      updatedAt: 1,
    };

    const rows = await Agent.find(predicate, projection)
      .sort({ updatedAt: -1, _id: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.json(rows.map(sanitize));
  } catch (e) {
    console.error('[public/agents] GET / error:', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

/** GET /api/public/agents/categories */
router.get('/categories', async (_req, res) => {
  try {
    if (!Agent) return res.status(500).json({ error: 'Agent model not available' });

    const forceAll = process.env.PUBLIC_AGENTS_DEBUG_ALL === '1';
    const predicate = forceAll ? {} : publicPredicate;

    const rows = await Agent.find(predicate, { category: 1, promoted: 1, featured: 1 }).lean();

    const set = new Set();
    let hasPromoted = false;
    for (const a of rows) {
      if (a?.category) set.add(String(a.category));
      if (a?.promoted || a?.featured) hasPromoted = true;
    }

    const sorted = Array.from(set).sort();
    const payload = [
      ...(hasPromoted
        ? [{ value: 'promoted', label: 'Top Picks', description: 'Recommended by SCL' }]
        : []),
      { value: 'all', label: 'All', description: 'Browse all shared agents' },
      ...sorted.map((c) => ({ value: c, label: c })),
    ];

    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.json(payload);
  } catch (e) {
    console.error('[public/agents] GET /categories error:', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;

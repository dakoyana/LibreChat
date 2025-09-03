const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/* Helpers */
function agentsCol() {
  const db = mongoose.connection?.db;
  return db ? db.collection('agents') : null;
}

function aclCol() {
  const db = mongoose.connection?.db;
  return db ? db.collection('aclentries') : null;
}

function agentCategoriesCol() {
  const db = mongoose.connection?.db;
  return db ? db.collection('agentcategories') : null;
}

async function getPublicAgentIds() {
  const col = aclCol();
  if (!col) return [];

  const entries = await col
    .find(
      { principalType: 'public', resourceType: 'agent', permBits: { $bitsAllSet: 1 } },
      { projection: { resourceId: 1 } },
    )
    .toArray();

  return entries.map((e) => e.resourceId);
}

const sanitize = (a = {}) => ({
  id: a._id?.toString?.() ?? a.id,
  name: a.name,
  description: a.description ?? a.shortDescription ?? '',
  avatarUrl:
    typeof a.avatar === 'string'
      ? a.avatar
      : a.avatar?.filepath || a.avatarUrl || '',
  category: a.category ?? 'General',
  tags: Array.isArray(a.tags) ? a.tags : [],
  promoted: Boolean(a.is_promoted),
  updatedAt: a.updatedAt ?? null,
});

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

router.get('/_debug', async (_req, res) => {
  try {
    const col = agentsCol();
    if (!col) return res.status(500).json({ ok: false, error: 'db_not_ready' });
    const count = await col.countDocuments({});
    const one = await col
      .find({}, { projection: { _id: 1, name: 1, category: 1, updatedAt: 1, avatar: 1, avatarUrl: 1, is_promoted: 1 } })
      .limit(1)
      .next();
    return res.json({ ok: true, count, sample: one ? sanitize(one) : null });
  } catch (e) {
    console.error('[public/agents/_debug] error:', e);
    return res.status(500).json({ ok: false, error: 'debug_failed' });
  }
});

router.get('/_schema', async (_req, res) => {
  try {
    const col = agentsCol();
    if (!col) return res.status(500).json({ ok: false, error: 'db_not_ready' });
    const one = await col.find({}, { projection: { _id: 0 } }).limit(1).next();
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

// GET /api/public/agents
router.get('/', async (req, res) => {
  try {
    const col = agentsCol();
    if (!col) return res.status(500).json({ error: 'db_not_ready' });

    const q = String(req.query.q || '').trim();
    const category = req.query.category ? String(req.query.category) : undefined;
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);

    const forceAll = process.env.PUBLIC_AGENTS_DEBUG_ALL === '1';
    let publicIds = [];
    if (!forceAll) {
      publicIds = await getPublicAgentIds();
      if (publicIds.length === 0) {
        res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
        return res.json([]);
      }
    }

    const and = [];
    if (!forceAll) and.push({ _id: { $in: publicIds } });
    if (category && category !== 'all' && category !== 'promoted') and.push({ category });
    if (category === 'promoted') and.push({ is_promoted: true });
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
      is_promoted: 1,
      updatedAt: 1,
    };

    const rows = await col
      .find(predicate, { projection })
      .sort({ updatedAt: -1, _id: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.json(rows.map(sanitize));
  } catch (e) {
    console.error('[public/agents] GET / error:', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// GET /api/public/agents/categories
router.get('/categories', async (_req, res) => {
  try {
    const col = agentsCol();
    const categoriesCol = agentCategoriesCol();
    if (!col || !categoriesCol) return res.status(500).json({ error: 'db_not_ready' });

    const forceAll = process.env.PUBLIC_AGENTS_DEBUG_ALL === '1';
    let publicIds = [];
    if (!forceAll) {
      publicIds = await getPublicAgentIds();
      if (publicIds.length === 0) {
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        return res.json([
          { value: 'all', label: 'All', description: 'Browse all shared agents' },
        ]);
      }
    }

    const predicate = forceAll ? {} : { _id: { $in: publicIds } };
    const rows = await col
      .find(predicate, { projection: { category: 1, is_promoted: 1 } })
      .toArray();

    const set = new Set();
    let hasPromoted = false;
    for (const a of rows) {
      if (a?.category) set.add(String(a.category));
      if (a?.is_promoted) hasPromoted = true;
    }

    const categories = set.size
      ? await categoriesCol
          .find(
            { value: { $in: Array.from(set) } },
            { projection: { value: 1, label: 1, description: 1 }, sort: { order: 1 } },
          )
          .toArray()
      : [];

    const payload = [
      ...(hasPromoted
        ? [{ value: 'promoted', label: 'Top Picks', description: 'Recommended by SCL' }]
        : []),
      { value: 'all', label: 'All', description: 'Browse all shared agents' },
      ...categories.map((c) => ({ value: c.value, label: c.label, description: c.description })),
    ];

    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.json(payload);
  } catch (e) {
    console.error('[public/agents] GET /categories error:', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;


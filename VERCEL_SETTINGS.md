# Vercel Project Settings — SCL Agents Hub (root-build)

**Repo**: `dakoyana/LibreChat` (root)  
**Deployment model**: Static frontend on Vercel, API on Railway (hybrid)

---

## Build & Output Settings
- **Framework Preset**: **Other** (don’t pick React/Vite/Next)
- **Root Directory**: `/` (repo root, **not** `/client`)
- **Install Command**: `npm ci --no-audit --prefer-offline`
- **Build Command**: `NODE_OPTIONS="--max-old-space-size=2048" npm run frontend:ci`
- **Output Directory**: `client/dist`

> These match the monorepo scripts and memory limits used in Docker.

## Routing (in `vercel.json`)
- Proxies to Railway (production networking name):
  - `/api/*` → `https://librechat-production-dce3.up.railway.app/api/*`
  - `/socket.io/*` → `https://librechat-production-dce3.up.railway.app/socket.io/*`
  - `/images/*`, `/uploads/*` → same host
- SPA fallbacks:
  - `/c/*`, `/settings/*`, `/auth/*`, and all other routes → `/index.html` in `client/dist`

## Git
- First deploy uses the repository default branch. After creation:
  - **Settings → Git → Production Branch**: set to `scl-ui`.
- `vercel.json` includes an **ignoreCommand** that skips production builds if the branch isn’t `scl-ui`.

## Env
- None required for the static frontend. All server secrets stay on Railway.
- (Optional) Connect **Railway ↔ Vercel** integration if you plan to add any Vercel Functions later.

## Notes
- If Vercel ever tries to run the build from `/client`, check **Root Directory** and remove any per-branch “root directory” overrides.
- Preview builds work from any branch/PR; production is gated to `scl-ui`.

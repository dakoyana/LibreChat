# Vercel Project Settings (Hybrid: UI on Vercel, API on Railway)

**Project root:** repository root (not `/client`)
**Framework preset:** Auto-detect (Vite/React)
**Node version:** ≥ 20.x
**Install command:** `npm ci`
**Build command:** `npm run frontend`
**Output directory:** `client/dist`
**Production branch:** `scl-ui`
**Environment Variables:** Use Railway→Vercel integration to sync DB/Redis/etc. (sealed vars don’t sync).

## Routing (from `vercel.json` at repo root)
- Rewrites:
  - `/api/:path*` → `https://librechat-production-dce3.up.railway.app/api/:path*`
  - `/auth/:path*` → `https://librechat-production-dce3.up.railway.app/auth/:path*`
  - SPA fallback: `"/((?!api|auth|assets|static|_next).*)" → "/"`
- Headers: set `Cache-Control: no-store` for `/api/:path*` to keep SSE streaming fresh.

> When you create `api.socialcatalystlab.app` (CNAME → Railway), update destinations in `vercel.json`.

## Monorepo note
LibreChat uses workspaces and shared packages. Building from the **repo root** ensures packages compile before the UI. Avoid pointing Vercel at `/client` only.

## Previews
Every PR to `scl-ui` creates a Vercel Preview. Use it for smoke tests (chat stream, uploads, auth).

## Optional: Ignored Build Step
Rebuild only when UI or shared packages change:
`git diff --quiet $VERCEL_GIT_PREVIOUS_SHA $VERCEL_GIT_COMMIT_SHA -- client packages || exit 1`

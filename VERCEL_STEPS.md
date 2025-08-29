# Step-by-step: First Vercel Deploy (root build)

1) **Commit** `vercel.json` at the repo root and push to GitHub.
2) In Vercel, **New Project → Import** the GitHub repo.
   - Framework Preset: **Other**
   - Root Directory: **/** (leave blank/`/` – do *not* select `/client`)
   - Install Command: `npm ci --no-audit --prefer-offline`
   - Build Command: `NODE_OPTIONS="--max-old-space-size=2048" npm run frontend:ci`
   - Output Directory: `client/dist`
3) Click **Deploy**. First deploy may use `main` as prod; that’s fine.
4) After it succeeds, open **Settings → Git** and set **Production Branch** = `scl-ui`.
5) Create/confirm **Domains** (eg. `www.socialcatalystlab.app`) and point DNS if needed.
6) Open the deployed site, verify:
   - App loads and routes (`/c/new`, `/settings`) work (client-side fallback to `/index.html`).
   - API calls hit Railway (`/api/*`), websockets (`/socket.io/*`) connect.
7) (Optional) Enable the **Railway ↔ Vercel** integration for env sync if you’ll add functions later.

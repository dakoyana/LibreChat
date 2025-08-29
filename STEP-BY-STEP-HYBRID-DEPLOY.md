# Step-by-Step: Hybrid Deploy (Vercel UI + Railway API)

## Prereqs
- API + DB already running on Railway (current state).
- Repo has long-lived `scl-ui` branch for UI changes.

## 1) Prepare branches
1. Create UI branch if needed: `git checkout -b scl-ui`

## 2) Add Vercel routing
2. Place the provided `vercel.json` at the **repo root**.
3. Commit it on `scl-ui`:
   ```bash
   git add vercel.json
   git commit -m "chore(vercel): rewrites for API/auth + SPA fallback"
   git push origin scl-ui
   ```

## 3) Create Vercel project
4. In Vercel → **New Project** → Import your GitHub fork.
5. **Project settings:**
   - Root Directory: **repository root**
   - Install: `npm ci`
   - Build: `npm run frontend`
   - Output: `client/dist`
   - Node: **20.x**
   - Production branch: **`scl-ui`**
6. Deploy → a first **Preview** will build.

## 4) Connect Railway → Vercel
7. In Railway → your project → **Integrations → Vercel**.
8. Connect account & select the Vercel project.
9. Map **Production** ↔ your Railway prod environment; **Preview** ↔ staging (optional).

## 5) Domains
10. Point **www.socialcatalystlab.app** to your Vercel project (Production).
11. (Optional/Recommended) Create **api.socialcatalystlab.app** CNAME → Railway API service.
12. Update `vercel.json` destinations to use `https://api.socialcatalystlab.app` once ready.

## 6) API readiness (Railway)
13. Ensure HTTPS end-to-end and confirm proxy trust on the API (cookies `Secure`, `trust proxy` enabled).
14. If relying on Vercel/CDN for static compression, set `DISABLE_COMPRESSION=true` on the API.

## 7) Smoke test (Vercel Preview)
15. Open the Preview URL:
    - Navigate to `/`, `/chat`, `/agents/123` (no 404s).
    - Start a chat; verify `/api/*` streams (SSE) successfully.
    - Log in or check `/auth/session` works (cookies on the Vercel domain).
    - Try a small file upload if your config supports it.
16. If green, promote Preview to **Production** (or push/merge to `scl-ui`).

## 8) Weekly sync with upstream
17. Update backend first: merge upstream → `main` → deploy on Railway.
18. Rebase/merge `main` → `scl-ui`.
19. Vercel Preview builds; re-run smoke tests.
20. Merge to `scl-ui` (or promote Preview) for Production UI.

## 9) Protections
21. Protect `scl-ui` in GitHub: require PR, Vercel Preview success, up-to-date with base, linear history.
22. Add `CODEOWNERS` for `/client/**` (enforce reviews).

## 10) Rollback
23. UI: redeploy previous Vercel deployment or revert last commit on `scl-ui`.
24. API: rollback Railway deployment to prior image/environment.

---
**Tip:** Once `api.socialcatalystlab.app` is live, future environment swaps (staging ↔ prod) do not require code changes—just update DNS or Railway mappings.

# Deployment (Vercel)

All 7 workspaces are deployed as separate Vercel projects under the `faguero-gmailcoms-projects`
team, each connected to this monorepo via `npx vercel --prod` (manual deploy — no GitHub App
integration is configured, since the repo owner and deployer are different accounts and inviting
a second member requires a paid Vercel plan). Redeploying after a change requires running
`vercel --prod` again from a checkout with the matching `.vercel/project.json` linked (see
"Redeploying" below).

## Live URLs

| App | URL | Role |
| --- | --- | --- |
| API (Fastify) | https://maitre-api.vercel.app | Backend for all apps |
| Dash (`apps/web`) | https://maitre-web-omega.vercel.app | Owner/Admin |
| Kitchen (`apps/kitchen`) | https://maitre-kitchen.vercel.app | Cooks (KDS) |
| Waiter (`apps/waiter`) | https://maitre-waiter.vercel.app | Mozos |
| Cashier (`apps/cashier`) | https://maitre-cashier.vercel.app | Caja |
| Host (`apps/host`) | https://maitre-host.vercel.app | Maître/recepción |
| Customer (`apps/customer`) | https://maitre-customer.vercel.app | Público (guest) |

## Project settings (configured in Vercel, not in git, except `apps/api/vercel.json`)

Each frontend project (`web`, `kitchen`, `waiter`, `cashier`, `host`, `customer`):

- Root Directory: `apps/<name>`
- Framework: Vite
- Install Command: `cd ../.. && npm install`
- Build Command: `cd ../.. && npm run build --workspace apps/<name>`
- Output Directory: `dist`
- Env: `VITE_API_URL=https://maitre-api.vercel.app` (production). `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_PUBLISHABLE_KEY` are **not** set, so these deployments use the fixture-token
  login path, not real Supabase Auth — set those two vars per-project to switch an app to real
  auth.

The API project (`apps/api`) uses the committed `apps/api/vercel.json` (declares
`api/serverless.ts` as the Function, rewrites all paths to it) plus these Vercel-side settings:

- Root Directory: `apps/api`
- Install Command: `cd ../.. && npm install`
- Build Command: `cd ../.. && npm run build --workspace apps/api`
- Env: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (production) — this makes the API auto-select the
  Supabase persistence/auth drivers (see `apps/api/src/composition/container.ts`).

## Redeploying

No GitHub-integration auto-deploy is configured (manual account/permission constraint, see above),
so a push to `main` does **not** automatically redeploy. To redeploy after a change:

```bash
git clone https://github.com/Adayala/maitre.git && cd maitre
npx vercel link --yes --project maitre-api   # or maitre-web / maitre-kitchen / etc.
npx vercel --prod --yes
```

Repeat per project. A future improvement would be a GitHub Actions workflow that runs the same
`vercel --prod` command for each project on push to `main`, using a `VERCEL_TOKEN` secret — this
was not set up in this pass to avoid touching CI/CD scope (SPEC-221) beyond what was requested.

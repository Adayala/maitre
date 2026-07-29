# Deployment (Vercel)

All 7 workspaces are deployed as separate Vercel projects. Production deployment is managed by
the `End-to-end` GitHub Actions workflow rather than the Vercel GitHub App. A push to `main`
deploys only the applications affected by that commit, after the quality gate and relevant E2E
tests pass.

## Live URLs

| App                        | URL                                 | Role                 |
| -------------------------- | ----------------------------------- | -------------------- |
| API (Fastify)              | https://maitre-api.vercel.app       | Backend for all apps |
| Dash (`apps/web`)          | https://maitre-web-omega.vercel.app | Owner/Admin          |
| Kitchen (`apps/kitchen`)   | https://maitre-kitchen.vercel.app   | Cooks (KDS)          |
| Waiter (`apps/waiter`)     | https://maitre-waiter.vercel.app    | Mozos                |
| Cashier (`apps/cashier`)   | https://maitre-cashier.vercel.app   | Caja                 |
| Host (`apps/host`)         | https://maitre-host.vercel.app      | Maître/recepción     |
| Customer (`apps/customer`) | https://maitre-customer.vercel.app  | Público (guest)      |

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

## Selective deployment

`tooling/deployment/detect-affected.mjs` builds the E2E and deployment matrices:

- A change under an individual frontend workspace tests and deploys only that frontend.
- An API or Supabase change deploys only the API, but runs every client E2E suite.
- A shared package, adapter, dependency lockfile, workflow, or root build configuration change
  tests and deploys every application.
- An E2E-only change runs the E2E suites without deploying production.
- A documentation-only change runs the quality gate without E2E or production deployment.
- An unknown runtime path falls back to all applications to avoid missing a required deployment.

The detector has unit coverage through `npm run deploy:affected:test`. A manually dispatched
`End-to-end` workflow intentionally selects every application.

## Manual redeployment

For an exceptional manual deployment from a correctly authorized checkout:

```bash
git clone https://github.com/Adayala/maitre.git && cd maitre
npx vercel link --yes --project maitre-api   # or maitre-web / maitre-kitchen / etc.
npx vercel --prod --yes
```

Repeat per project when using the CLI. Normally, use the `workflow_dispatch` trigger on the
`End-to-end` workflow to validate and redeploy all projects.

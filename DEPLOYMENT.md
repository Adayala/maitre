# Deployment (Vercel)

All 7 workspaces are deployed as separate Vercel projects. Production deployment is managed by
the `End-to-end` GitHub Actions workflow rather than the Vercel GitHub App. A push to `main`
deploys only the applications affected by that commit, after the quality gate and relevant E2E
tests pass.

## Delivery flow

The repository does not rely on the Vercel GitHub App for authoritative delivery. GitHub Actions
uses the `VERCEL_TOKEN` repository secret plus the non-secret organization and project IDs
declared in `.github/workflows/e2e.yml`.

```text
pull request
  → detect affected applications
  → Quality gate + affected E2E + CodeQL
  → merge
  → repeat validation on the exact main SHA
  → deploy affected Vercel projects
```

Production deployment is never run for a pull request. The deploy matrix is enabled only for a
push to `main`, after Quality and all selected E2E jobs succeed.

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

| Changed path                                                     | E2E selection | Production deployment |
| ---------------------------------------------------------------- | ------------- | --------------------- |
| `apps/<frontend>/**`                                             | that frontend | that frontend         |
| `apps/api/**`, `supabase/**`, `vercel.api.json`                  | all clients   | API                   |
| `packages/**`, `adapters/**`, lockfile or shared build/CI config | all clients   | all projects          |
| `tests/e2e/**`, `playwright.config.mjs`                          | all clients   | none                  |
| docs/specs only                                                  | none          | none                  |
| unknown runtime path                                             | all clients   | all projects          |

The detector reports its JSON decision in the GitHub Actions step summary. Its ordering is stable
and project IDs never come from changed files or pull-request input.

## Deployment identity

The deployed UI exposes the commit metadata produced by the build. Vercel supplies Git metadata
for the checked-out repository, and the manual full-deploy workflow additionally injects
`VITE_GIT_COMMIT_SHA` and `VITE_DEPLOYED_AT`. Use the visible commit SHA together with the GitHub
Actions run to confirm that the running application corresponds to the merged revision.

The authoritative evidence for an automatic release is:

- merged `main` commit SHA;
- `End-to-end` workflow run and selected matrix;
- individual `Deploy · <application>` job;
- Vercel deployment generated by that job.

## Failure and retry

- A failed Quality or selected E2E job prevents every production deployment in that run.
- A failure in one Vercel matrix entry does not cancel the other application deployments.
- Fix the cause and merge a new commit; do not bypass the gates.
- For an operational retry of the exact current code, dispatch `End-to-end` manually. Manual
  dispatch deliberately validates and deploys all seven projects.
- The separate `Deploy to Vercel` manual workflow is retained as a full-deploy operational
  fallback and must not replace normal gated delivery.

## Manual redeployment

For an exceptional CLI deployment from a correctly authorized checkout:

```bash
git clone https://github.com/Adayala/maitre.git && cd maitre
npx vercel link --yes --project maitre-api   # or maitre-web / maitre-kitchen / etc.
npx vercel --prod --yes
```

Repeat per project when using the CLI. Normally, use the `workflow_dispatch` trigger on the
`End-to-end` workflow to validate and redeploy all projects.

# Durable runtime profile

Shared Maitre API deployments must use:

```text
APP_ENV=preview|development|demo|production
PERSISTENCE_DRIVER=supabase
AUTH_DRIVER=supabase
SUPABASE_URL=<server endpoint>
SUPABASE_SECRET_KEY=<server-only credential>
CORS_ALLOWED_ORIGINS=<comma-separated exact HTTPS origins>
```

`SUPABASE_SERVICE_ROLE_KEY` remains a legacy alias. Neither server credential may be exposed to a
browser build, log, test artifact or pull-request output.

The API resolves and validates the complete profile before constructing repositories or seeding
data. `APP_ENV` falls back to provider `VERCEL_ENV`, so omitting the application variable cannot
silently select memory in Vercel. Unknown drivers, incomplete Supabase credentials, memory
persistence or fixture authentication in a shared environment abort startup.

The production deployment workflow runs the same fail-closed policy against the environment file
downloaded by Vercel before `vercel deploy`. Its success output contains only booleans and adapter
names, never credential values. The preflight rejects wildcard, credential-bearing, path-bearing or
missing CORS origins.

Provider status `Ready` is not release evidence by itself. After deployment, CI calls both
`/health/live` and `/health/ready` on the immutable deployment URL and fails unless they return
JSON with status `ok` and `ready`, respectively. This catches serverless
startup/configuration failures before the job is considered successful.

Local and hermetic test commands may use:

```text
APP_ENV=local|test|e2e
PERSISTENCE_DRIVER=memory
AUTH_DRIVER=fixture
```

That profile is explicitly non-release and does not prove migrations, RLS or restart durability.
The authoritative release journey provisions ephemeral PostgreSQL/Supabase, applies migrations
from zero, executes MVP-J-001, restarts the API, verifies durable reads and destroys the stack
without backup. That CI path is the release evidence; a memory-profile pass remains useful only
for local feedback.

## Validation commands

```bash
npm run runtime:profile:test
npm run runtime:grants:test
node tooling/deployment/check-runtime-profile.mjs --env-file <path> --expect demo
node tooling/deployment/check-deployment-health.mjs <immutable-deployment-url>
```

The first two commands are hermetic. The latter two inspect a concrete candidate environment and
deployment without printing credential values.

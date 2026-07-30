# Durable runtime profile

Shared Maitre API deployments must use:

```text
APP_ENV=preview|development|demo|production
PERSISTENCE_DRIVER=supabase
AUTH_DRIVER=supabase
SUPABASE_URL=<server endpoint>
SUPABASE_SECRET_KEY=<server-only credential>
```

`SUPABASE_SERVICE_ROLE_KEY` remains a legacy alias. Neither server credential may be exposed to a
browser build, log, test artifact or pull-request output.

The API resolves and validates the complete profile before constructing repositories or seeding
data. `APP_ENV` falls back to provider `VERCEL_ENV`, so omitting the application variable cannot
silently select memory in Vercel. Unknown drivers, incomplete Supabase credentials, memory
persistence or fixture authentication in a shared environment abort startup.

The production deployment workflow runs the same fail-closed policy against the environment file
downloaded by Vercel before `vercel deploy`. Its success output contains only booleans and adapter
names, never credential values.

Local and hermetic test commands may use:

```text
APP_ENV=local|test|e2e
PERSISTENCE_DRIVER=memory
AUTH_DRIVER=fixture
```

That profile is explicitly non-release and does not prove migrations, RLS or restart durability.
The authoritative release journey remains incomplete until CI provisions ephemeral
PostgreSQL/Supabase, applies migrations from zero and verifies cleanup.

# Inventario de configuración — SPEC-214

Este documento define nombres, consumidores y clasificación. No contiene valores reales.

## Browser build

| Variable                        | Requerida         | Propósito                  | Ambientes                  |
| ------------------------------- | ----------------- | -------------------------- | -------------------------- |
| `VITE_APP_ENV`                  | sí                | `local                     | preview                    | development | demo` | todos los builds web |
| `VITE_APP_VERSION`              | sí                | commit/version sanitizada  | preview, development, demo |
| `VITE_API_BASE_URL`             | sí                | origen público de API      | todos                      |
| `VITE_SUPABASE_URL`             | sí para Auth real | URL pública del proyecto   | preview, development, demo |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | sí para Auth real | clave pública para browser | preview, development, demo |

Sólo este allowlist puede entrar al bundle. Ningún nombre que contenga `SECRET`, `SERVICE_ROLE`, `DATABASE`, `PASSWORD`, `PRIVATE_KEY` o `MIGRATION` es aceptado por el schema/browser audit.

## API runtime

| Variable                      | Requerida                  | Secreta | Propósito                                                     |
| ----------------------------- | -------------------------- | ------- | ------------------------------------------------------------- |
| `APP_ENV`                     | sí                         | no      | ambiente lógico Maitre                                        |
| `APP_VERSION`                 | sí fuera de local          | no      | commit/version desplegada                                     |
| `PERSISTENCE_DRIVER`          | sí fuera de local/test/e2e | no      | `supabase`; `memory` está prohibido en ambientes compartidos  |
| `AUTH_DRIVER`                 | sí fuera de local/test/e2e | no      | `supabase`; `fixture` está prohibido en ambientes compartidos |
| `SUPABASE_URL`                | con drivers Supabase       | no      | endpoint server-side de persistencia y JWKS                   |
| `SUPABASE_SECRET_KEY`         | con persistencia Supabase  | sí      | credencial server-only del adapter PostgREST actual           |
| `SUPABASE_SERVICE_ROLE_KEY`   | alias legado               | sí      | fallback temporal de `SUPABASE_SECRET_KEY`; nunca browser     |
| `SUPABASE_PUBLISHABLE_KEY`    | Auth Supabase opcional     | no      | header público para verificación cuando aplica                |
| `LOG_LEVEL`                   | sí                         | no      | nivel allowlisted                                             |
| `API_HOST`                    | local/Node                 | no      | bind address; adapter puede proveerlo                         |
| `API_PORT`                    | local/Node                 | no      | puerto validado                                               |
| `CORS_ALLOWED_ORIGINS`        | sí                         | no      | allowlist explícita                                           |
| `DATABASE_URL`                | sí                         | sí      | conexión pooled de runtime                                    |
| `AUTH_PROVIDER`               | sí                         | no      | adapter seleccionado, inicialmente `supabase`                 |
| `AUTH_ISSUER`                 | sí                         | no      | issuer esperado                                               |
| `AUTH_AUDIENCE`               | sí                         | no      | audience esperada                                             |
| `AUTH_JWKS_URL`               | sí                         | no      | origen confiable de claves públicas                           |
| `AUTH_ALLOWED_ALGORITHMS`     | sí                         | no      | allowlist, nunca derivada del token                           |
| `AUTH_CLOCK_SKEW_SECONDS`     | sí                         | no      | tolerancia acotada                                            |
| `REQUEST_TIMEOUT_MS`          | sí                         | no      | presupuesto máximo de request                                 |
| `OTEL_SERVICE_NAME`           | si OTLP                    | no      | nombre estable del servicio                                   |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | no                         | no      | activa export de trazas/métricas OTLP                         |
| `OTEL_EXPORTER_OTLP_HEADERS`  | según backend              | sí      | autenticación del collector                                   |
| `OTEL_TRACES_SAMPLER`         | si OTLP                    | no      | sampler estándar OpenTelemetry                                |
| `OTEL_TRACES_SAMPLER_ARG`     | según sampler              | no      | argumento acotado del sampler                                 |
| `OTEL_METRIC_EXPORT_INTERVAL` | si OTLP                    | no      | período de export de métricas                                 |
| `OTEL_METRIC_EXPORT_TIMEOUT`  | si OTLP                    | no      | timeout de export de métricas                                 |

El adapter de persistencia Supabase actual usa PostgREST y por eso requiere
`SUPABASE_SECRET_KEY` (o el alias legado `SUPABASE_SERVICE_ROLE_KEY`) en el proceso API. La
credencial es server-only, no entra en builds browser ni artifacts. Reemplazarla por una conexión
SQL con rol mínimo requiere una decisión de adapter posterior; hasta entonces el deploy preflight
falla si la credencial falta.

## Migraciones

| Variable                 | Requerida    | Secreta | Consumidor                         |
| ------------------------ | ------------ | ------- | ---------------------------------- |
| `DATABASE_MIGRATION_URL` | sí al migrar | sí      | job/manual autorizado de migración |
| `MIGRATION_ENV`          | sí al migrar | no      | guard contra target incorrecto     |

Estas variables no se entregan al browser, Preview ni al proceso API normal. Las migraciones verifican target y requieren aprobación explícita para ambientes compartidos.

## Test/CI

| Variable       | Requerida   | Propósito                                       |
| -------------- | ----------- | ----------------------------------------------- |
| `APP_ENV=test` | sí          | activa únicamente configuración segura de tests |
| `DATABASE_URL` | integración | base efímera/sintética                          |
| `CI`           | provista    | comportamiento no interactivo                   |

Tests unitarios no requieren Supabase, Vercel ni red. Secrets canarios deben ser falsos, revocables y distinguibles de credenciales reales.

`memory`/`fixture` sólo son perfiles herméticos de desarrollo y test. `preview`, `development`,
`demo`, `production` y cualquier otro ambiente no local deben declarar ambos drivers Supabase de
forma explícita; la API y el workflow de deployment fallan antes de servir tráfico si el perfil no
es durable.

## Mapping de integración

La integración puede proporcionar nombres como `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `POSTGRES_URL` o variantes directas/non-pooling. Un paso de deployment/configuración los mapea así, sujeto a SPK-02/03:

```text
public Supabase URL        -> VITE_SUPABASE_URL
publishable browser key   -> VITE_SUPABASE_PUBLISHABLE_KEY
pooled runtime connection -> DATABASE_URL
direct migration connection -> DATABASE_MIGRATION_URL
```

No se realiza mapping automático de una secret/service-role key. Los nombres exactos ofrecidos por el proveedor se registran durante el spike sin sus valores.

## Ownership inicial

| Área                         | Owner     | Reviewer  | Rotación/acción                          |
| ---------------------------- | --------- | --------- | ---------------------------------------- |
| Supabase project/integration | pendiente | pendiente | revocar conexión o rotar desde proveedor |
| Vercel project variables     | pendiente | pendiente | actualizar por environment y redeploy    |
| Database runtime             | pendiente | pendiente | rotar y validar readiness                |
| Database migration           | pendiente | pendiente | rotar fuera del runtime                  |
| Auth public configuration    | pendiente | pendiente | actualizar build y redeploy              |

Los nombres personales se completan durante onboarding; ninguna fila se considera operativa mientras owner/reviewer sigan pendientes.

# SPECIFICATION — SPEC-210

## Perfil inicial

- **Database:** Supabase PostgreSQL.
- **Identity provider:** Supabase Auth.
- **Object storage:** Supabase Storage cuando una spec lo requiera.
- **Application runtime:** Node.js en Vercel.
- **Browser:** React.js consume APIs de Maitre y endpoints de autenticación permitidos; no consulta tablas operacionales directamente.

## Topología

```text
React.js
  |-- Auth client boundary ----------> Supabase Auth
  `-- HTTPS -------------------------> Maitre Node.js API
                                          |
                                          | application ports
                                          v
                                  Supabase adapters
                                      |       |
                                      v       v
                                  Postgres   Storage
```

## Puertos requeridos

- `UserIdentityPort`
- `SessionVerificationPort`
- `TenantRepositoryPort`
- repositorios por agregado, no un cliente SQL genérico compartido
- `UnitOfWorkPort`
- `ObjectStoragePort`
- `DatabaseHealthPort`

El SDK de Supabase y los detalles de conexión viven solo en adapters y composition roots.

## Modelo de identidad

`auth.users` representa identidad y credenciales del proveedor. El dominio mantiene su propia entidad `User` y memberships:

```text
auth.users.id
    |
    v
identity.users.external_identity_id
    |
    +--> memberships --> tenant + roles + branches
```

El token autentica una identidad. La autorización de tenant, sucursal, rol y entitlement se resuelve en Maitre; no se confía únicamente en claims no verificados o editables por el usuario.

## Multi-tenancy

- Toda tabla operacional incluye `tenant_id` explícito cuando corresponda.
- La API Node.js establece y verifica el contexto de tenant.
- RLS se habilita en tablas expuestas y actúa como defensa en profundidad.
- Cada policy tiene tests positivos y negativos de acceso cruzado.
- La service role nunca se distribuye al navegador.
- Grants mínimos y RLS se crean mediante migraciones versionadas, no cambios manuales del dashboard.

## Conexiones desde Vercel

- Runtime serverless: usar Shared Pooler/Supavisor en transaction mode.
- Migraciones, `pg_dump` y administración: conexión directa cuando el entorno soporte IPv6 o método oficial compatible.
- No usar prepared statements cuando el modo transaction pooling no los soporte.
- Timeout explícito, conexiones acotadas y recuperación ante sockets obsoletos.
- La configuración de runtime y migraciones utiliza credenciales separadas.

## Migraciones

- SQL versionado en el repositorio es la fuente de verdad.
- Migraciones forward-only durante el MVP, con procedimiento de rollback compensatorio.
- Schema, grants, roles, RLS, índices y funciones se revisan como código.
- El dashboard de Supabase no se usa para cambios no reproducibles.
- Cada migración se prueba desde base vacía y sobre una copia del estado anterior.

## Backups en Free

El contrato normativo de ciclo de vida, RPO/RTO y restauración está en
[`SPEC-220 — Data Lifecycle, Backup & Disaster Recovery`](../spec-220-transversal-data-lifecycle-disaster-recovery/).

Supabase recomienda exportaciones periódicas para proyectos Free. Maitre requiere:

- `pg_dump` lógico cifrado fuera de Supabase;
- frecuencia diaria mientras existan datos que no puedan regenerarse;
- retención inicial de 7 copias diarias y 4 semanales, sujeta al presupuesto gratuito;
- hash, fecha, versión de schema y resultado del backup;
- prueba de restauración mensual y antes de cambios destructivos;
- objetos exportados por separado porque el backup de base no contiene Storage.

Datos de demo regenerables pueden excluirse si existe un seed versionado.

## Storage

- Buckets privados por defecto.
- Paths con tenant y aggregate id, sin confiar en el path como único control.
- Signed URLs cortas generadas por backend.
- Límites de MIME, tamaño y cantidad definidos por spec.
- Metadata y ownership en PostgreSQL.
- Exportación verificable hacia un storage S3-compatible u otro adapter.

## Ambientes

Con dos proyectos activos en Free:

1. `development`: compartido para integración, regenerable.
2. `demo`: estable para demostraciones, con datos ficticios.

Tests unitarios no usan Supabase. Integración puede usar PostgreSQL/Supabase local o un entorno efímero compatible. No se crea un proyecto remoto por pull request.

## Salida

La migración debe poder separar:

- PostgreSQL mediante dump/restore y migraciones SQL;
- objetos mediante inventario + descarga/copia + hashes;
- identidades mediante exportación disponible y flujo de reautenticación/reset cuando los hashes no sean transferibles;
- sesiones mediante invalidación controlada;
- adaptadores mediante reemplazo en composition root.

# SPECIFICATION — SPEC-210

## Perfil candidato

- **Database:** Supabase PostgreSQL, pendiente SPK-02/04/06.
- **Identity provider:** Supabase Auth, pendiente SPK-03.
- **Object storage:** sin habilitar en I0; Supabase Storage es candidato futuro.
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
- RLS se habilita en tablas tenant-scoped y actúa como defensa en profundidad según el patrón probado en SPK-04.
- Cada policy tiene tests positivos y negativos de acceso cruzado.
- Una secret/service-role key nunca se distribuye al navegador y no es requisito del runtime I0.
- Grants mínimos y RLS se crean mediante migraciones versionadas, no cambios manuales del dashboard.

## Conexiones candidatas desde Vercel

- Runtime serverless: validar Shared Pooler/Supavisor y modo adecuado mediante SPK-02.
- Migraciones, `pg_dump` y administración: conexión directa cuando el entorno soporte IPv6 o método oficial compatible.
- Configurar prepared statements según el modo demostrado; `prepare: false` es hipótesis, no resultado.
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
- frecuencia y retención aprobadas por SPEC-220 cuando existan datos no regenerables;
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

Topología mínima:

1. primer proyecto `development`: integración/previews con datos sintéticos, aislamiento lógico y cleanup;
2. segundo proyecto `demo`: sólo si SPEC-213 demuestra que separar la demo estable es necesario y la cuota sigue vigente.

Tests unitarios no usan Supabase. Integración puede usar PostgreSQL/Supabase local o un entorno efímero compatible. No se crea un proyecto remoto por pull request.

Previews no ejecutan migraciones sobre el proyecto compartido. Un workflow autorizado aplica migraciones compatibles usando `DATABASE_MIGRATION_URL`; runtime usa únicamente `DATABASE_URL` pooled según SPEC-214.

## Estado de adopción

- Documentación, comparación o conexión de cuentas no equivalen a PASS.
- SPK-02/03/04/06 comienzan `NOT_RUN` y aportan evidencia a ADR-002.
- Hasta aceptar ADR-002 sólo se permite código de spike aislado; no migraciones productivas ni adapters asumidos como baseline.
- Un resultado FAIL/INCONCLUSIVE actualiza la comparación y puede activar una alternativa sin modificar domain/application.

## Salida

La migración debe poder separar:

- PostgreSQL mediante dump/restore y migraciones SQL;
- objetos mediante inventario + descarga/copia + hashes;
- identidades mediante exportación disponible y flujo de reautenticación/reset cuando los hashes no sean transferibles;
- sesiones mediante invalidación controlada;
- adaptadores mediante reemplazo en composition root.

# Contrato de estructura PostgreSQL — SPEC-210

## Propósito

Este documento define el baseline normativo de persistencia para I0. Su objetivo es hacer que
la futura migración sea una traducción verificable de contratos aprobados, no un lugar donde se
inventan reglas de dominio.

No contiene DDL ni autoriza implementar migraciones. Ante una diferencia, la spec de la entidad
define semántica y este contrato define representación, aislamiento y consistencia transversal.
La discrepancia debe resolverse antes de generar SQL.

## Alcance I0

La primera estructura persistente comprende solamente:

- organización: Tenant, Brand, FiscalEntity, Branch, Salon y Table;
- identidad propia: User, Membership, Role y Permission;
- asignaciones de rol, permisos y alcance de sucursal;
- outbox transaccional y auditoría mínima requerida por esos agregados;
- metadata de migraciones administrada por la herramienta elegida.

Catálogo, reservas, operación, pagos y fiscalidad agregan sus tablas mediante sus propias specs y
migraciones posteriores. No se crean tablas anticipadas ni columnas genéricas para esos dominios.

## Namespaces y ownership

| Schema | Owner lógico | Acceso I0 |
| --- | --- | --- |
| `auth` | proveedor de identidad | sólo referencia de identidad; no se modifica desde migraciones Maitre |
| `maitre` | aplicación | tablas, índices, policies y funciones propias |
| schema de la herramienta | migrador | historial de migraciones; nunca contiene datos de negocio |

Las tablas operacionales no viven en `public`. El browser no recibe grants sobre `maitre` ni
consulta sus tablas. El acceso normal ocurre por la API Node.js y sus repositorios. Cualquier
exposición futura mediante API de datos requiere una spec y threat model independientes.

El runtime y el migrador usan roles distintos:

- `maitre_runtime`: DML mínimo sobre objetos aprobados, sin DDL ni bypass de aislamiento;
- `maitre_migrator`: DDL y administración de policies sólo durante despliegues autorizados;
- roles administrativos del proveedor: fuera del runtime y del browser.

Los nombres concretos de roles pueden ser adaptados por el proveedor, pero esas capacidades no
pueden combinarse en una misma credencial de aplicación.

## Convenciones físicas

- tablas y columnas en `snake_case`, plurales para tablas;
- UUID como identificador opaco, generado por la aplicación o por una función PostgreSQL estándar
  aprobada; nunca IDs secuenciales expuestos;
- `timestamptz` en UTC para instantes; fechas civiles usan `date`; horarios locales no se guardan
  como sustituto de un instante;
- cada agregado mutable posee `version bigint NOT NULL` para concurrencia optimista;
- `created_at`, `updated_at` obligatorios; `created_by` y `updated_by` cuando existe actor;
- estados como texto con `CHECK` versionado mientras no exista una razón demostrada para tipos enum
  PostgreSQL; así se preservan migraciones expand/contract;
- texto normalizado en aplicación y respaldado por índices/constraints case-insensitive cuando la
  unicidad sea semántica;
- importes futuros en unidades monetarias menores enteras y código ISO 4217, nunca `float`;
- `jsonb` sólo para configuración versionada y acotada por spec; no reemplaza relaciones, estados
  ni campos consultables;
- no se usan arrays de UUID para modelar relaciones muchos-a-muchos;
- borrado físico prohibido para registros sujetos a auditoría o referencias históricas; el estado
  de lifecycle definido por la entidad es la autoridad.

## Regla estructural de tenancy

Toda tabla tenant-scoped incluye `tenant_id NOT NULL`, incluso si puede inferirse mediante otra FK.
La redundancia es deliberada: permite predicados, índices y policies uniformes.

Cada relación entre filas tenant-scoped debe demostrar pertenencia al mismo tenant en la base. El
patrón preferido es:

1. la tabla padre ofrece una clave candidata `UNIQUE (tenant_id, id)`;
2. la hija declara una FK compuesta `(tenant_id, parent_id)`;
3. todo índice de consulta operacional comienza por `tenant_id` salvo evidencia contraria;
4. repositorio y RLS vuelven a aplicar el contexto como defensa en profundidad.

Una FK sólo por `parent_id` no satisface aislamiento aunque el ID sea UUID. Triggers se permiten
únicamente si una constraint declarativa no puede expresar la invariante y existe una prueba que
justifica la excepción.

`users` es global y no contiene `tenant_id`; el acceso del usuario a un tenant existe únicamente a
través de una Membership efectiva. Catálogos globales deben declararse explícitamente como tales.

## Modelo relacional I0

El detalle de columnas y el registro de discrepancias entre las specs fuente están en
[`i0-physical-dictionary.md`](i0-physical-dictionary.md).

```text
auth.users (externo)
    1 ─── 0..1 maitre.users
                 |
                 +── memberships ── tenants
                       |   |             |
                       |   |             +── brands
                       |   |             |     |
                       |   |             |     +── branches
                       |   |             |           |
                       |   |             |           +── salons ── dining_tables
                       |   |             |
                       |   |             +── fiscal_entities
                       |   |
                       |   +── membership_branch_scopes ── branches
                       +── membership_roles ── roles ── role_permissions ── permissions

aggregate transaction ── domain_outbox
privileged mutation  ── audit_log
```

### Tablas de organización

| Tabla | Scope | Claves y relaciones mínimas | Unicidad mínima |
| --- | --- | --- | --- |
| `tenants` | global/root | `id`; lifecycle y auditoría | identificador de negocio normalizado cuando SPEC-001 lo apruebe |
| `brands` | tenant | `(tenant_id) -> tenants`; `id` | `(tenant_id, slug_normalized)` |
| `fiscal_entities` | tenant | `(tenant_id) -> tenants`; `id` | `(tenant_id, cuit)` |
| `branches` | tenant | FK compuesta a Brand; FK compuesta opcional a FiscalEntity | `(tenant_id, code_normalized)` |
| `salons` | tenant | FKs compuestas a Branch | `(tenant_id, branch_id, name_normalized)` |
| `dining_tables` | tenant | FKs compuestas a Branch y Salon | `(tenant_id, salon_id, number_normalized)` |

`tables` no se utiliza como nombre físico por su ambigüedad técnica; la entidad de dominio sigue
llamándose `Table`. Branch, Salon y Table conservan `tenant_id` aunque su ancestry ya lo determine.
La FK a Salon debe impedir además asociar una mesa con una Branch diferente.

Certificados fiscales, claves privadas y puntos de venta no se mezclan en `fiscal_entities`: sus
estructuras corresponden a las specs fiscales. Ninguna clave privada se almacena en texto plano.

### Tablas de identidad y autorización

| Tabla | Scope | Claves y relaciones mínimas | Unicidad mínima |
| --- | --- | --- | --- |
| `users` | global | `id`, `identity_provider`, `external_identity_id` | `(identity_provider, external_identity_id)` |
| `memberships` | tenant | FKs a Tenant y User | una relación no terminal efectiva por `(tenant_id, user_id)` según SPEC-020 |
| `roles` | catálogo global | seed versionado; sin `tenant_id` | `code` estable |
| `permissions` | catálogo global | key canónica `resource.action` | `key` |
| `membership_roles` | tenant | FK compuesta a Membership y FK global a Role | `(tenant_id, membership_id, role_code)` |
| `role_permissions` | catálogo global | FKs globales a Role y Permission | `(role_code, permission_code)` |
| `membership_branch_scopes` | tenant | FKs compuestas a Membership y Branch | `(tenant_id, membership_id, branch_id)` |

El email es un snapshot de contacto y no una clave de autorización. No se replica password, token,
session ni metadata sensible de `auth.users`. La unión con el proveedor usa subject estable más
provider, nunca email.

El alcance `ALL_BRANCHES` se representa como modo explícito en Membership; no se materializa creando
una fila por Branch. Para `SELECTED_BRANCHES` deben existir filas en `membership_branch_scopes` y
pertenecer al mismo tenant. Las dos representaciones son mutuamente excluyentes por invariante
transaccional.

## Outbox y auditoría

`domain_outbox` guarda eventos producidos por cambios confirmados en la misma transacción:

- `id`, `tenant_id` nullable sólo para eventos realmente globales;
- `aggregate_type`, `aggregate_id`, `event_type`, `event_version`;
- payload versionado, `occurred_at`, `recorded_at`;
- estado/intentos de publicación y timestamps de claim/publicación;
- clave de idempotencia o constraint equivalente.

El payload no contiene secretos y minimiza PII. La tabla no sustituye el historial de dominio.

`audit_log` es append-only para mutaciones administrativas o sensibles. Registra actor, tenant,
acción, recurso, resultado, request/correlation ID e instante. No almacena tokens, contraseñas,
claves, certificados privados ni cuerpos completos sin clasificación previa. SPEC-044 mantiene la
semántica de auditoría; este baseline sólo reserva su integración transaccional.

## RLS y contexto de ejecución

RLS se habilita y fuerza en cada tabla tenant-scoped una vez que SPK-04 apruebe el mecanismo de
propagación. El contrato lógico es independiente de la técnica exacta:

- sin tenant autenticado, acceso denegado;
- lectura y escritura requieren que `tenant_id` coincida con el contexto validado por la API;
- `WITH CHECK` impide insertar o mover filas a otro tenant;
- tablas puente validan tanto su `tenant_id` como el de ambos extremos;
- jobs globales usan una identidad operativa específica, auditable y no accesible al request path;
- el owner de las tablas no es el rol de runtime y no puede neutralizar accidentalmente RLS.

No se define una policy basada directamente en metadata editable del JWT. El backend resuelve
User y Membership y propaga un contexto probado por SPK-04. Hasta ese PASS, no se elige entre
variable transaccional, rol restringido u otro mecanismo.

La suite de integración debe incluir por tabla: acceso permitido Tenant A, lectura Tenant A→B
vacía/denegada, insert cruzado denegado, update que cambia `tenant_id` denegado y FK cross-tenant
denegada.

## Índices y constraints

- cada PK, FK y FK compuesta tiene soporte de índice acorde a sus queries;
- índices tenant-scoped comienzan por `tenant_id` y continúan con filtros/orden estable;
- unicidad sobre nombres, códigos y slugs normalizados coincide exactamente con su scope;
- checks reflejan límites estables (capacidad, version positiva, estados aprobados), no reglas que
  requieran datos externos o el reloj;
- índices parciales para estados activos requieren una query demostrada y una semántica estable;
- no se agregan índices “por si acaso”; cada uno referencia un caso de uso y se valida con plan;
- todas las listas paginadas tienen orden total mediante un desempate por `id`.

## Transacciones y concurrencia

Una unidad de trabajo incluye agregado, relaciones internas, outbox y auditoría obligatoria. No se
publica un evento antes del commit. Updates de agregados comparan `version` y la incrementan en la
misma sentencia; cero filas afectadas representa conflicto de concurrencia, no not-found automático.

Provisioning de Tenant, altas de Membership y cambios de scopes/roles deben ser atómicos. Las
invariantes que involucren varias tablas se validan dentro de esa transacción y, cuando exista
contención, con constraint o lock mínimo documentado.

## Migraciones

La secuencia inicial propuesta, aún no implementable, es:

1. schemas, extensiones estrictamente necesarias y roles/grants;
2. `tenants` y tablas base de organización;
3. `users`, memberships y RBAC;
4. outbox y auditoría mínima;
5. FKs compuestas, checks, unicidad e índices;
6. RLS/policies tras PASS de SPK-04;
7. seed idempotente de permissions y roles built-in, si sus specs lo aprueban;
8. verificación desde base vacía, upgrade desde N-1 y aislamiento Tenant A/B.

Cada migración es forward-only, pequeña, determinista y revisable como SQL. Los cambios incompatibles
siguen expand/migrate/contract en despliegues separados. Ninguna preview aplica migraciones sobre una
base compartida y ningún cambio manual de dashboard constituye estado válido.

## Portabilidad

El core usa PostgreSQL estándar. Una extensión, función o tipo específico debe:

1. estar encapsulado en persistencia;
2. incluir alternativa o procedimiento de salida;
3. ser probado por SPEC-226;
4. quedar registrado en ADR-002 antes de volverse baseline.

Dump/restore debe preservar schemas Maitre, constraints, índices, grants y policies sin depender de
datos de `auth`. La relación con identidades externas se exporta como referencia opaca y admite un
flujo documentado de reautenticación al cambiar de proveedor.

## Gates antes de generar DDL

- [ ] ADR-002 aceptado y deciders asignados.
- [ ] SPK-02 valida conexión/pooling de runtime y conexión de migrador.
- [ ] SPK-04 valida contexto y RLS sin bypass desde runtime.
- [ ] owners/reviewers aprueban SPEC-001–006 y SPEC-017–020 o registran excepciones.
- [ ] diferencias de nombres, estados y nulabilidad entre specs antiguas están resueltas.
- [ ] herramienta de migración y ubicación de archivos están aprobadas por ADR de arquitectura.
- [ ] credenciales de runtime y migración están separadas y cargadas fuera del repositorio.
- [ ] toda credencial expuesta por canal no autorizado fue revocada y rotada.

## Criterios de aceptación del contrato

1. Cada tabla I0 posee owner lógico, scope, PK, FKs, unicidad y lifecycle trazables.
2. Ninguna relación tenant-scoped puede materializar una referencia cross-tenant.
3. El modelo de identidad no usa email ni claims editables como autorización.
4. Un revisor puede derivar el orden de migraciones sin tomar decisiones de dominio nuevas.
5. La estrategia RLS incluye pruebas positivas y negativas y no concede acceso al browser.
6. El diseño funciona en PostgreSQL estándar y documenta toda excepción del proveedor.
7. La migración puede verificarse desde cero, desde N-1 y mediante dump/restore.

## Decisiones pendientes

| Decisión | Autoridad | Estado |
| --- | --- | --- |
| Supabase como adapter inicial | ADR-002 + SPEC-226 | pendiente |
| mecanismo exacto de contexto RLS | SPK-04 | pendiente |
| herramienta/generador de migraciones | ADR de arquitectura | pendiente |
| campos físicos definitivos por entidad | SPEC-001–006, 017–020 | requiere reconciliación |
| ownership y reviewers | governance SDD | pendiente |
| región, pooler y límites del proyecto Free | handoff + spikes | pendiente |

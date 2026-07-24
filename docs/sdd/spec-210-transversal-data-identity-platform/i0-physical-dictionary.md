# Diccionario físico propuesto I0 — SPEC-210

## Estado y autoridad

Este diccionario reconcilia SPEC-001–006 y SPEC-017–020 con el contrato transversal de
[`database-structure.md`](database-structure.md). Es una propuesta normativa para review, no DDL ni
una autorización de implementación.

La precedencia usada es:

1. `contract.md` especializado de la entidad;
2. invariantes de `specification.md` y `rules.md` que no contradigan el contrato;
3. contrato transversal de SPEC-210/219;
4. `structure.md` previo como antecedente no vinculante.

Toda fila marcada `OPEN-*` bloquea la migración afectada. `PK` significa primary key; `FK-C`
significa FK compuesta que incluye `tenant_id`.

Las resoluciones recomendadas, todavía pendientes de sign-off, están en
[`i0-decision-proposals.md`](i0-decision-proposals.md).

## Columnas compartidas

Los agregados mutables usan el siguiente bloque, salvo excepción explícita:

| Columna | Tipo | Null | Regla |
| --- | --- | --- | --- |
| `id` | `uuid` | no | PK, inmutable |
| `version` | `bigint` | no | inicia en 1, `CHECK (version > 0)`, optimistic concurrency |
| `created_at` | `timestamptz` | no | asignado por servidor |
| `created_by` | `uuid` | sí | actor global; null sólo para bootstrap/sistema auditado |
| `updated_at` | `timestamptz` | no | no anterior a `created_at` |
| `updated_by` | `uuid` | sí | misma política que `created_by` |

Las FKs de actores se agregan después de `users`, inicialmente diferibles sólo si el orden de
bootstrap lo exige. No se usa cascade delete. Las tablas append-only y de asignación definen su
propio bloque temporal.

## Organización

### `maitre.tenants` — SPEC-001

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido | — | — | root global |
| `name` | `varchar(120)` | no | trim/NFC; nombre legal/display pendiente OPEN-001 |
| `status` | `varchar(20)` | no | `PROVISIONING/ACTIVE/SUSPENDED/CLOSED` propuesto |
| `default_locale` | `varchar(35)` | no | locale BCP 47 soportado |
| `default_currency` | `char(3)` | no | ISO 4217 upper-case |
| `default_timezone` | `varchar(64)` | no | timezone IANA soportada |
| `contact_email` | `varchar(320)` | sí | normalizado; no unique ni identidad |
| `contact_phone` | `varchar(32)` | sí | formato normalizado pendiente del contrato de contacto |
| `closed_at` | `timestamptz` | sí | requerido sólo si status `CLOSED` |

No se propone slug ni identificador comercial hasta resolver OPEN-001. Todas las tablas hijas
referencian `tenants(id)` y declaran `UNIQUE (tenant_id, id)` cuando sean padre tenant-scoped.

### `maitre.brands` — SPEC-002

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido + `tenant_id` | — | no | FK Tenant; `UNIQUE (tenant_id, id)` |
| `name` | `varchar(100)` | no | 3–100, trim/NFC |
| `slug` | `varchar(100)` | no | canonical lower-case; unique case-insensitive por tenant |
| `description` | `varchar(500)` | sí | texto sanitizado |
| `status` | `varchar(20)` | no | `ACTIVE/INACTIVE/ARCHIVED` |
| `logo_uri` | `varchar(2048)` | sí | URI, no objeto/blob |
| `website_uri` | `varchar(2048)` | sí | URI validada |
| `visual_config` | `jsonb` | sí | sólo schema versionado de presentación |
| `contact_config` | `jsonb` | sí | sólo campos permitidos y schema versionado |
| `archived_at` | `timestamptz` | sí | coherente con status |
| `archived_by` | `uuid` | sí | actor global |

`default_menu_id`, políticas de cancelación, alérgenos y currency no entran en I0: pertenecen a
otros agregados o requieren contrato de herencia. `config` genérico se divide para evitar un
contenedor sin ownership.

### `maitre.fiscal_entities` — SPEC-003

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido + `tenant_id` | — | no | FK Tenant; `UNIQUE (tenant_id, id)` |
| `country_code` | `char(2)` | no | ISO 3166-1 alpha-2 |
| `tax_id` | `varchar(32)` | no | normalizado por país; CUIT argentino = 11 dígitos |
| `legal_name` | `varchar(200)` | no | 3–200, trim/NFC |
| `tax_condition` | `varchar(40)` | no | catálogo/versionado por país |
| `fiscal_address` | `jsonb` | no | schema de dirección versionado; migrar a columnas si se consulta |
| `status` | `varchar(20)` | no | vocabulario pendiente OPEN-003 |
| `valid_from` | `date` | sí | vigencia civil |
| `valid_to` | `date` | sí | no anterior a `valid_from` |

Unicidad propuesta: `(tenant_id, country_code, tax_id)`. Certificado, clave privada,
`arca_authorized_at` y puntos de venta quedan fuera de esta tabla. La tabla
`fiscal_certificates` del structure histórico no se crea desde esta spec.

### `maitre.branches` — SPEC-004

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido + `tenant_id` | — | no | FK Tenant; `UNIQUE (tenant_id, id)` |
| `brand_id` | `uuid` | no | FK-C a Brand, inmutable sin workflow |
| `fiscal_entity_id` | `uuid` | sí | FK-C a FiscalEntity |
| `code` | `varchar(32)` | no | normalizado upper-case; unique por tenant |
| `name` | `varchar(120)` | no | trim/NFC |
| `timezone` | `varchar(64)` | no | timezone IANA |
| `status` | `varchar(20)` | no | `ACTIVE/INACTIVE` propuesto; OPEN-004 |
| `address_line1` | `varchar(160)` | sí | dirección estructurada |
| `address_line2` | `varchar(160)` | sí | — |
| `city` | `varchar(100)` | sí | requerido si existe dirección |
| `subdivision` | `varchar(100)` | sí | — |
| `postal_code` | `varchar(24)` | sí | — |
| `country_code` | `char(2)` | sí | requerido si existe dirección |
| `contact_email` | `varchar(320)` | sí | normalizado |
| `contact_phone` | `varchar(32)` | sí | normalizado |

No existen `services_active`, `config` ni `menu_id`. La coherencia de FiscalEntity se valida con
FK `(tenant_id, fiscal_entity_id)`; que esté activa para nuevas operaciones sigue siendo regla de
dominio.

### `maitre.salons` — SPEC-005

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido + `tenant_id` | — | no | `UNIQUE (tenant_id, id)` y `(tenant_id, branch_id, id)` |
| `branch_id` | `uuid` | no | FK-C a Branch, inmutable |
| `name` | `varchar(80)` | no | trim/NFC; unique normalizado por Branch |
| `description` | `varchar(500)` | sí | — |
| `max_capacity` | `integer` | no | `> 0`; límite administrativo |
| `status` | `varchar(20)` | no | `ACTIVE/INACTIVE` |

Unicidad: `(tenant_id, branch_id, normalized_name)`. `capacity` histórico se reemplaza por
`max_capacity`; no es una suma derivada de mesas.

### `maitre.dining_tables` — SPEC-006

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido + `tenant_id` | — | no | `UNIQUE (tenant_id, id)` |
| `branch_id` | `uuid` | no | FK-C a Branch, inmutable |
| `salon_id` | `uuid` | no | FK `(tenant_id, branch_id, salon_id)` a Salon |
| `number` | `varchar(16)` | no | trim/NFC; unique normalizado por Salon |
| `name` | `varchar(80)` | sí | etiqueta de presentación |
| `capacity` | `smallint` | no | `BETWEEN 1 AND 20` |
| `shape` | `varchar(20)` | sí | `ROUND/RECTANGULAR/SQUARE/IRREGULAR` |
| `zone` | `varchar(80)` | sí | etiqueta normalizada |
| `features` | `jsonb` | no | schema versionado, default `{}` |
| `layout` | `jsonb` | sí | schema versionado, sólo presentación |
| `status` | `varchar(20)` | no | `ACTIVE/INACTIVE` administrativo |

No existe una columna de estado operativo. La proyección de SPEC-051/057 es otra estructura. La
capacidad agregada contra `salons.max_capacity` exige transacción y test concurrente.

## Identidad y RBAC

### `maitre.users` — SPEC-017

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido | — | — | identidad global |
| `identity_provider` | `varchar(64)` | no | key estable del adapter |
| `external_identity_id` | `varchar(255)` | no | subject opaco |
| `email` | `varchar(320)` | sí | snapshot; no autorización ni unique |
| `display_name` | `varchar(120)` | no | trim/NFC |
| `locale` | `varchar(35)` | sí | preferencia |
| `timezone` | `varchar(64)` | sí | preferencia IANA |
| `status` | `varchar(20)` | no | vocabulario pendiente OPEN-017 |
| `disabled_at` | `timestamptz` | sí | nombre final depende de OPEN-017 |
| `deleted_at` | `timestamptz` | sí | borrado lógico/anonymization |

Unicidad: `(identity_provider, external_identity_id)`. El nombre físico se normaliza a `users`,
no `identity_users`, porque el schema ya expresa el bounded context. No hay FK desde esta tabla a
`auth.users`: la referencia permanece opaca y portable.

### `maitre.roles` — SPEC-018

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| `code` | `varchar(32)` | no | PK lógica, upper-case, inmutable |
| `name_key` | `varchar(120)` | no | localization key |
| `description_key` | `varchar(120)` | no | localization key |
| `status` | `varchar(20)` | no | `ACTIVE/INACTIVE` propuesto; OPEN-018 |
| `catalog_version` | `integer` | no | `> 0` |

Role es catálogo global versionado, no tenant-scoped ni CRUD. Se persiste mediante seed idempotente
para que FKs, auditoría y cambios atómicos de permisos sean verificables. `assignable_by` se modela
como relación sólo si SPEC-018 define su semántica exacta.

### `maitre.permissions` — SPEC-019

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| `code` | `varchar(128)` | no | PK lógica; regex del contrato |
| `resource` | `varchar(64)` | no | parte canónica del code |
| `action` | `varchar(64)` | no | parte canónica del code |
| `description_key` | `varchar(120)` | no | localization key |
| `sensitivity` | `varchar(20)` | no | catálogo pendiente OPEN-019 |
| `status` | `varchar(20)` | no | `ACTIVE/DEPRECATED` |
| `successor_code` | `varchar(128)` | sí | self-FK; distinto de `code` |
| `catalog_version` | `integer` | no | `> 0` |

Permission es catálogo global versionado y sin wildcards. La persistencia no vuelve dinámico al
catálogo: sólo materializa el contrato definido por código/migración.

### `maitre.role_permissions` — SPEC-018/019

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| `role_code` | `varchar(32)` | no | FK Role |
| `permission_code` | `varchar(128)` | no | FK Permission |
| `catalog_version` | `integer` | no | versión de introducción |
| `created_at` | `timestamptz` | no | seed/migración |

PK `(role_code, permission_code)`. Es catálogo global; no contiene `tenant_id`.

### `maitre.memberships` — SPEC-020

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| bloque compartido + `tenant_id` | — | no | FK Tenant; `UNIQUE (tenant_id, id)` |
| `user_id` | `uuid` | no | FK global User |
| `status` | `varchar(20)` | no | `INVITED/ACTIVE/SUSPENDED/REVOKED` |
| `branch_scope_type` | `varchar(20)` | no | `ALL_BRANCHES/SELECTED_BRANCHES` |
| `invitation_id` | `uuid` | sí | referencia opaca pendiente de spec de invitación |
| `invited_at` | `timestamptz` | sí | coherente con lifecycle |
| `activated_at` | `timestamptz` | sí | — |
| `suspended_at` | `timestamptz` | sí | — |
| `revoked_at` | `timestamptz` | sí | requerido si REVOKED |

La unicidad es parcial para una Membership no terminal por `(tenant_id, user_id)`, pendiente de
definir si `SUSPENDED` se considera reutilizable. Un `UNIQUE` simple histórico impediría preservar
múltiples ciclos revocados y contradice el contrato.

### `maitre.membership_roles`

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| `tenant_id` | `uuid` | no | scope RLS |
| `membership_id` | `uuid` | no | FK-C Membership |
| `role_code` | `varchar(32)` | no | FK catálogo Role |
| `created_at` | `timestamptz` | no | — |
| `created_by` | `uuid` | sí | actor global |

PK `(tenant_id, membership_id, role_code)`. Reemplaza `membership_role_assignments`; el nombre breve
es consistente con otras tablas puente.

### `maitre.membership_branch_scopes`

| Columna | Tipo | Null | Constraint/semántica |
| --- | --- | --- | --- |
| `tenant_id` | `uuid` | no | scope RLS |
| `membership_id` | `uuid` | no | FK-C Membership |
| `branch_id` | `uuid` | no | FK-C Branch |
| `created_at` | `timestamptz` | no | — |
| `created_by` | `uuid` | sí | actor global |

PK `(tenant_id, membership_id, branch_id)`. Sólo admite filas si Membership usa
`SELECTED_BRANCHES`; `ALL_BRANCHES` exige cero filas.

## Índices mínimos derivados

Además de PK/unique/FK:

| Tabla | Índice candidato | Caso de uso |
| --- | --- | --- |
| `brands` | `(tenant_id, status, id)` | listar brands activas con orden total |
| `fiscal_entities` | `(tenant_id, status, id)` | selección administrativa |
| `branches` | `(tenant_id, brand_id, status, id)` | contexto del walking skeleton |
| `salons` | `(tenant_id, branch_id, status, id)` | floor setup |
| `dining_tables` | `(tenant_id, salon_id, status, id)` | floor setup |
| `memberships` | `(tenant_id, user_id, status)` | resolver contexto efectivo |
| `membership_branch_scopes` | `(tenant_id, branch_id, membership_id)` | autorización inversa por Branch |
| `domain_outbox` | índice parcial de pendientes | dispatcher; detalle en contrato de outbox |

Estos índices son candidatos, no una orden de creación. Cada query se confirma con contrato de
repositorio y `EXPLAIN` en el spike.

## Registro de reconciliación

| ID | Conflicto | Propuesta | Bloquea |
| --- | --- | --- | --- |
| OPEN-001 | Tenant usa `ACTIVE/SUSPENDED/ARCHIVED` en structure y `PROVISIONING/ACTIVE/SUSPENDED/CLOSED` en contract | adoptar el contrato; definir legal/display name y cierre | `tenants` |
| OPEN-002 | Brand structure mezcla config, menú y políticas de otros dominios | limitar a visual/contact config versionada; menú fuera de I0 | `brands` sólo si se mantiene JSONB |
| OPEN-003 | FiscalEntity no define vocabulario final de status y structure incluye certificados | separar certificados; definir lifecycle fiscal | `fiscal_entities` |
| OPEN-004 | Branch structure admite `ARCHIVED`; contract sólo `ACTIVE/INACTIVE` | adoptar contract y dejar retención a lifecycle transversal | `branches` |
| OPEN-005 | Salon usa `capacity` en structure y `maxCapacity` en contract | adoptar `max_capacity` | no, salvo objeción de owner |
| OPEN-006 | Table carece de structure físico | adoptar `dining_tables` y campos del contract | no, salvo objeción de owner |
| OPEN-017 | User usa `ACTIVE/SUSPENDED/DEACTIVATED`, `ACTIVE/DISABLED/DELETED` y nombres timestamp distintos | owner debe elegir lifecycle y semántica de anonymization | `users` |
| OPEN-018 | Role structure dice hardcoded; contract exige catálogo por código/migración y campos adicionales | catálogo global persistido con seed idempotente | RBAC |
| OPEN-019 | Permission structure dice hardcoded; contract exige deprecation/successor auditable | catálogo global persistido con seed idempotente | RBAC |
| OPEN-020 | Membership structure usa unique permanente; contract permite preservar ciclos revocados | índice parcial para relación no terminal; precisar SUSPENDED | `memberships` |

## Gate de salida

El diccionario queda listo para traducirse a un plan de migración cuando:

- cada `OPEN-*` tenga decisión registrada en su spec fuente;
- se aprueben nombres, tipos, nulabilidad y lifecycle por owner/reviewer;
- el threat model valide PII, RLS y roles PostgreSQL;
- los contratos de repositorio enumeren queries que justifican índices;
- se elija la herramienta de migraciones sin alterar este modelo;
- SPEC-226 entregue PASS para conexión, migración, RLS y portabilidad.

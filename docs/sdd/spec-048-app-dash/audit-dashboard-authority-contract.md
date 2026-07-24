# Contrato de autoridad — Audit y Dashboard

## Semántica de auditoría por clase

| Clase | Ejemplos | Persistencia | Ante falla |
| --- | --- | --- | --- |
| A crítica | roles/scopes, soporte cross-tenant, secrets/OAuth | domain + audit/outbox atómicos | rollback/fail closed |
| B financiera/fiscal/laboral | payment/refund, cash, invoice, time adjustment | domain + audit/outbox atómicos | rollback/fail closed |
| C operativa sensible | reopen/override/cancel, policy publish | domain + audit/outbox atómicos | rollback/fail closed |
| D ordinaria | CRUD draft/config no sensible | audit atómico preferido | si recovery outbox durable existe, commit + alert; de otro modo rollback |
| E lectura/telemetría | login/read/export attempt, health | append async durable | continuar sólo con gap marker/alert |

El handler no escribe dos transacciones independientes fingiendo atomicidad. Para A–C el audit
record/outbox comparte commit con el cambio. Falla antes/durante commit no cambia dominio; caída tras
commit se recupera desde outbox idempotente. E puede degradar únicamente si existe durable sequence
capaz de detectar/reconciliar gaps.

## Integridad y threat model

Protege contra API actor, application credential y modificación accidental; un administrador DB
total puede destruir datos, pero debe dejar discrepancia verificable frente a checkpoints externos.

Cada tenant/partition mantiene sequence monotónica y hash chain:
`entryHash = H(version | partition | sequence | occurredAt | canonicalPayload | previousHash)`.
Canonicalización y algoritmo se versionan. Un checkpoint periódico `{partition,lastSequence,
lastHash,range,createdAt}` se firma/MAC con key fuera de la DB y se exporta a storage separado.

Verifier periódico detecta missing/duplicate sequence, broken chain, checkpoint mismatch y atraso;
emite finding/alert no editable. Export incluye manifest, range, counts, first/last hash, checkpoint,
schema version y artifact hash. Correcciones son nuevos registros, nunca update/delete.

Break-glass DB/support exige step-up, approval/ticket, TTL y actor real; su acceso también se registra
en control plane separado. Restore verifica chain/checkpoints antes de declarar éxito.

## Soporte cross-tenant

Permisos `platform.support.session.start`, `audit.read`, `resource.read` y `export` son control-plane,
no Membership tenant. La sesión liga actor, tenant, ticket/reason, allowed actions, started/expiresAt,
step-up y approver; default read-only, sin wildcard permanente. UI muestra modo soporte. Cada acceso
registra actor real + supportSession ID; impersonation nunca reemplaza actor por el usuario tenant.

## Setup capability-aware

Checklist se deriva de país, selected journey y Entitlements/ServiceCatalog:

- siempre: tenant identity, membership owner/admin y al menos Branch;
- floor: salon/table sólo si capability FLOOR está enabled;
- catalog/order: published menu sólo si esas capabilities están enabled;
- fiscal: FiscalEntity/PointOfSale/certificate/homologation sólo si fiscal capability y país/regla
  aplican; si no, `NOT_APPLICABLE`, no INCOMPLETE;
- integrations/AI: sólo tras capability/proveedor aprobado.

Estados `COMPLETE | INCOMPLETE | BLOCKED | NOT_APPLICABLE`, con rule/catalog version y reason. Links
son navegación autorizada, no prueba de permiso ni completion.

## Overview versus Analytics

Overview sólo contiene proyección operacional actual: setup, ServicePeriod/Visits/tables, kitchen
alerts, open Check/Cash blockers y connector health esencial. Usa contadores/estados definidos por
dominios, con `asOf/freshness`; no define fórmulas históricas, ML, trends ni reportes.

Analytics SPEC-187–206 posee métricas históricas, trends, predictions e insights. Overview puede
enlazar o mostrar una MetricDefinition publicada por ID/version, nunca copiar fórmula. Timeout de una
sección produce PARTIAL/UNAVAILABLE y no cero.

## Dependencias y journeys I0

SPEC-044 depende de SPEC-217/219/220; SPEC-045 de 044/215/219; SPEC-046 de Organization,
Subscription y capabilities; SPEC-047 de 046, domain projections y SPEC-216; SPEC-048 de 046/047,
SPEC-212/215/219.

Journeys verificables: setup vacío→accionable; capability no aplicable; overview parcial; support
session expirada; audit query/export redactado; teclado/foco/zoom/touch; offline cache read-only con
staleness. Owner/reviewer y aprobación permanecen bloqueados.

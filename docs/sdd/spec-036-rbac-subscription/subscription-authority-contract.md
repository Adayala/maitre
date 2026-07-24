# Contrato de autoridad — Subscription

## Service Catalog Registry

El catálogo administrado por plataforma es la única autoridad de servicios:

- `serviceCode` estable ASCII (`DOMAIN.CAPABILITY`), display name localizado y lifecycle
  `DRAFT | ACTIVE | DEPRECATED | RETIRED`;
- value type (`BOOLEAN | QUANTITY | ENUM | CONFIG`), unit, scopes permitidos y config schema;
- aggregation (`OR | MAX | SUM_EXPLICIT | MOST_RESTRICTIVE | REJECT_CONFLICT`), default deny y
  dependency/conflict codes;
- effective interval, catalog version, owner, reviewer y migration/successor.

Una versión publicada es inmutable. API, seeds, calculator y consumers referencian code + catalog
version; no duplican tipos/reglas. Un code desconocido, retired sin migration, schema inválido o
conflicto de tipos falla cerrado. Provider/billing config no forma parte del catálogo de dominio.

## Lifecycle efectivo

| Subscription | Nuevos writes | Reads/export | En curso | Datos |
| --- | --- | --- | --- | --- |
| TRIAL | permitidos por entitlement/quotas | permitidos | continúan | conservados |
| ACTIVE | permitidos por entitlement/quotas | permitidos | continúan | conservados |
| SUSPENDED | denegados salvo recovery allowlist | lectura/export permitidos | terminan seguro o quedan read-only según service policy | conservados |
| CANCELLED con grace | denegados | lectura/export permitidos hasta deadline | no se inician nuevos | conservados según retention |
| CANCELLED post-grace | denegados | sólo export/legal/support autorizado | reconciliación/retention workflows | anonimizar/borrar por policy |

La transición no borra datos ni interrumpe una operación financiera/fiscal a mitad de commit.
ServiceCatalog define por capability la recovery allowlist y grace; ausencia usa deny-new-writes y
read/export. Reactivation requiere command auditado y recomputación antes de aceptar writes.

## Reducción de cuota

Si `currentUsage > proposedLimit`, el cambio queda `PENDING_REMEDIATION`; no entra en vigor, no
borra recursos y no marca entitlement engañoso. Contiene current/proposed, measuredAt/revision,
deadline, remediation options y approver.

Durante remediation se conserva el límite anterior para recursos existentes y se bloquean nuevas
altas que aumenten consumo. Al bajar consumo se revalida atómicamente y aplica. Override temporal
requiere permission, reason, expiry y límite; vencimiento no elimina recursos automáticamente.

## Boundary de plataforma

Permisos separados y no asignables por tenants:

- `platform.subscription.provision`, `suspend`, `cancel`, `reactivate`;
- `platform.service_catalog.manage/publish`;
- `platform.quota.override` y `platform.subscription.audit.read`.

El actor de plataforma usa identidad workforce administrada fuera del tenant, step-up, environment
allowlist y audit con actor real, tenant objetivo, ticket/reason, before/after e impersonation flag.
No obtiene permisos operativos del tenant ni puede autoasignarse Membership. Producción puede exigir
dual approval para cancelación/reducción.

## Dependencias

| Specs | Dependencias |
| --- | --- |
| 027–030 | SPEC-001 y este Service Catalog Registry |
| 031–032 | 027–030, SPEC-023/026, SPEC-215, SPEC-219 |
| 033–034 | 027–029, SPEC-217 |
| 035 | 027–030 + catalog/policy version |
| 036 | SPEC-018/019/020, SPEC-219 y boundary de plataforma |

Owner/reviewer nominales y aprobación siguen bloqueados; este contrato no promueve readiness.

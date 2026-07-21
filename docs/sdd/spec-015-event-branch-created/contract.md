# Contrato del evento — SPEC-015

## Identidad

- Nombre: `organization.branch.created.v1`.
- Aggregate: Branch / `branchId`.
- Productor: Organization después del commit de Branch.
- Delivery: outbox al menos una vez según SPEC-217.

## Payload

Envelope estándar más `branchId`, `tenantId`, `brandId`, `fiscalEntityId`, `name`,
`timezone`, `status` y `createdAt`. Dirección/teléfono no se publican; consumidores que los
requieran usan una lectura autorizada.

## Reglas

- IDs relacionados pertenecen al mismo tenant;
- timezone es IANA válida y queda fijada al momento del hecho;
- el evento no implica que onboarding, salons, mesas o suscripciones estén completos;
- consumidores no confían en el payload para permisos;
- duplicados y orden parcial se resuelven por `eventId` y versión de aggregate.

## Consumidores y aceptación

Floor/Dashboard, Subscription y Analytics pueden inicializar proyecciones idempotentes.
Tests cubren outbox atómico, schema, retry/DLQ, duplicados, tenant isolation, payload
mínimo y compatibilidad. Fallas de consumidor no revierten la Branch creada.

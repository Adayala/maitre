# Contrato del evento — SPEC-013

## Identidad

- Nombre: `organization.tenant.created.v1`.
- Aggregate: Tenant / `tenantId`.
- Productor: módulo Organization después de commit exitoso.
- Delivery: outbox de SPEC-217; al menos una vez.

## Envelope

Campos obligatorios: `eventId`, `eventName`, `eventVersion`, `occurredAt`, `tenantId`,
`aggregateId`, `correlationId`, `causationId` opcional, `actor` sanitizado y `payload`.

Payload mínimo: `tenantId`, `name`, `status`, `createdAt`. No incluye CUIT, dirección,
email, tokens, secrets, plan derivado ni snapshot completo del agregado.

## Semántica

Se emite exactamente una intención lógica por creación confirmada. Duplicados físicos son
posibles y consumidores deduplican por `eventId`. Orden global no está garantizado; para el
mismo aggregate se usa versión/posición monotónica cuando el transporte la provee.

## Consumidores

Identity, Subscription/Billing y Analytics pueden inicializar proyecciones idempotentes.
La ausencia o falla de un consumidor no revierte la creación del Tenant. Ningún consumidor
interpreta el evento como autorización para acceso.

## Compatibilidad y aceptación

Cambios aditivos opcionales conservan v1; cambio de significado/remoción crea nueva
versión. Tests verifican outbox atómico, schema, datos mínimos, duplicación, retry, DLQ y
correlation. Logs/artifacts no exponen PII ni secretos.

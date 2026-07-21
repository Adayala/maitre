# Contrato del evento — SPEC-024

## Identidad

- Nombre: `identity.user.invited.v1`.
- Aggregate: MembershipInvitation / `invitationId`.
- Productor: Identity tras persistir invitación/outbox.
- Delivery: al menos una vez según SPEC-217.

## Payload mínimo

`invitationId`, `tenantId`, `userId` opcional, email opaco/redactado o referencia segura,
roles/scopes solicitados, `invitedBy`, `expiresAt`, `createdAt`. Nunca incluye token/link,
secret, credencial del proveedor ni email completo si el consumidor no lo necesita.

## Semántica

Se emite por nueva invitación o nueva revisión lógica, no por cada retry de entrega. El
servicio de notificación consume idempotentemente y obtiene contenido sensible mediante un
canal autorizado. El evento no activa Membership hasta aceptación/flujo definido.

## Aceptación

Atomicidad con outbox, schema/version, duplicados, retry/DLQ, expiración y redacción tienen
tests. Consumidor fallido no revierte la invitación y ningún log/artifact contiene tokens.

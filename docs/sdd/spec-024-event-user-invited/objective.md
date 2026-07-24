# Objetivo — SPEC-024

## Propósito

Publicar una invitación de Membership confirmada para que canales autorizados notifiquen al
destinatario sin transportar tokens, credenciales ni PII innecesaria.

## Criterios de aceptación

### CAD-024-01 — Una nueva invitación lógica confirmada produce `identity.user.invited.v1`

Una nueva invitación lógica confirmada produce `identity.user.invited.v1` para aggregate
`MembershipInvitation/invitationId`.

### CAD-024-02 — Invitación y outbox se confirman atómicamente

Invitación y outbox se confirman atómicamente; retry de entrega conserva eventId y no crea otra
invitación.

### CAD-024-03 — El payload incluye refs, roles, scopes, invitedBy, expiry y timestamps sin tokens

Payload incluye refs, roles/scopes solicitados, invitedBy, expiry y timestamps, pero nunca token/link,
secret o credencial.

### CAD-024-04 — Email sólo se incluye redactado u opaco cuando el consumidor autorizado lo necesita

Email sólo se incluye redactado/opaco cuando el consumidor autorizado lo necesita; contenido sensible
se obtiene por canal seguro.

### CAD-024-05 — El evento no activa Membership y consumidores deduplican y respetan expiry

El evento no activa Membership y consumidores deduplican, respetan expiry y fallan cerrado ante
versión desconocida.

### CAD-024-06 — Schema, retry, DLQ, redacción y retención se verifican sin revertir la invitación

Schema, retry/DLQ, redacción, retención y artifacts se verifican sin que una falla de notificación
revierta la invitación.

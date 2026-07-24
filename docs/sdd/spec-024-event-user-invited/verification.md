# Verificación — SPEC-024

## Criterios

### CAD-024-01 — Una nueva invitación lógica confirmada produce `identity.user.invited.v1` para aggregate `MembershipInvitation/invitationId`

- [ ] una invitación lógica confirmada produce una sola intención lógica;
- [ ] aggregate e `invitationId` coinciden con contrato;
- [ ] reintentos físicos no crean otra invitación lógica.

### CAD-024-02 — Invitación y outbox se confirman atómicamente; retry de entrega conserva eventId y no crea otra invitación

- [ ] invitación y outbox son atómicos;
- [ ] retry físico conserva `eventId`;
- [ ] rollback no deja evento publicable.

### CAD-024-03 — Payload incluye refs, roles/scopes solicitados, invitedBy, expiry y timestamps, pero nunca token/link, secret o credencial

- [ ] aggregate/envelope/payload cumplen schema v1;
- [ ] payload sólo contiene refs y metadata aprobadas;
- [ ] token, link, secret o credencial no aparecen.

### CAD-024-04 — Email sólo se incluye redactado/opaco cuando el consumidor autorizado lo necesita; contenido sensible se obtiene por canal seguro

- [ ] email completo no aparece salvo política autorizada explícita;
- [ ] el contenido sensible se obtiene por canal seguro;
- [ ] redacción/opacidad queda verificada.

### CAD-024-05 — El evento no activa Membership y consumidores deduplican, respetan expiry y fallan cerrado ante versión desconocida

- [ ] el evento no activa Membership;
- [ ] consumidores deduplican y respetan expiry;
- [ ] versión desconocida falla cerrado.

### CAD-024-06 — Schema, retry/DLQ, redacción, retención y artifacts se verifican sin que una falla de notificación revierta la invitación

- [ ] expiry, retry/DLQ y retención tienen outcomes verificables;
- [ ] correlation/causation y actor sanitizado se preservan;
- [ ] una falla de notificación no revierte la invitación confirmada.

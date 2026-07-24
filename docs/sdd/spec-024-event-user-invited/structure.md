# Structure — SPEC-024

Envelope SPEC-217: eventId, eventName/version, aggregateId/type, tenantId, occurredAt,
correlation/causation, actor sanitizado y payload mínimo.

Aggregate: `MembershipInvitation/invitationId`. Serialización JSON versionada. Outbox e invitación
son atómicos; token/link no forma parte del evento.

# Contrato de evento — SPEC-119 WorkShiftStarted

Publicar `workforce.work-shift.started.v1` sólo cuando un command cambia `WorkShift` de
`PUBLISHED` a `IN_PROGRESS`; no representa primer `clock-in` ni hora planificada.

El contrato implementado hoy usa el outbox común con:

- `eventId`, `eventName`, `eventVersion`, `occurredAt`, `producer`, `tenantId`,
  `aggregateType`, `aggregateId`, `correlationId`;
- `producer = workforce`, `eventVersion = 1`, `aggregateType = WorkShift`.

Payload implementado:

- `workShiftId`
- `branchId`
- `startsAtUtc`
- `endsAtUtc`
- `startedAt`
- `laborPolicyVersion`
- `aggregateRevision`
- `actorType = INTERNAL`

No forman parte del contrato I0 conteos operativos, staffing aggregates, PII, remuneración ni
identificadores de employments o assignments.

# Contrato de evento — SPEC-120 WorkShiftCompleted

Publicar `workforce.work-shift.completed.v1` al completar administrativamente `WorkShift`; no
representa `clock-out` individual.

El contrato implementado hoy usa el outbox común con:

- `eventId`, `eventName`, `eventVersion`, `occurredAt`, `producer`, `tenantId`,
  `aggregateType`, `aggregateId`, `correlationId`;
- `producer = workforce`, `eventVersion = 1`, `aggregateType = WorkShift`.

Payload implementado:

- `workShiftId`
- `branchId`
- `completedAt`
- `laborPolicyVersion`
- `aggregateRevision`
- `outcome = COMPLETED`
- `actorType = INTERNAL`

No forman parte del contrato I0 agregados de finalización, staffing/privacy flags, `EmploymentId`,
time entries, payroll ni importes.

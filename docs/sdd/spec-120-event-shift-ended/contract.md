# Contrato de evento — SPEC-120 WorkShiftCompleted

Publicar `workforce.work-shift.completed.v1` al completar administrativamente WorkShift; no
representa clock-out individual. El sobre
versionado incluye eventId, occurredAt, tenantId, branchId, shiftId, outcome y agregados no
personales; no incluye fichadas individuales ni datos salariales. Tests cubren jornadas aún
abiertas, cierre forzado, reintento, duplicados, reordenamiento, compatibilidad, correlación y
aislamiento entre tenants.

En I0, `branchId`, `completedAt`, `laborPolicyVersion`, `aggregateRevision`, `outcome` y
`actorType` constituyen el payload mínimo obligatorio; agregados de finalización/flags de privacy
quedan diferidos u opcionales.

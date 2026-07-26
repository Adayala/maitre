# Contrato de entidad — SPEC-111 WorkShift

`WorkShift` representa una ventana laboral planificada de una sucursal. El contrato implementado
incluye:

- identidad y aislamiento: `id`, `tenantId`, `branchId`;
- calendario: `timezone`, `businessDate`, `startsAtUtc`, `endsAtUtc`;
- control operativo: `laborPolicyVersion`, `servicePeriodId?`, `status`, `revision`;
- auditoría básica: `createdAt`, `updatedAt`, `publishedAt?`, `startedAt?`, `completedAt?`,
  `cancelledAt?`.

Estados válidos: `DRAFT`, `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.

Transiciones válidas: `DRAFT -> PUBLISHED|CANCELLED`, `PUBLISHED -> IN_PROGRESS|CANCELLED`,
`IN_PROGRESS -> COMPLETED`.

El contrato actual no define capacidad, rol requerido, capabilities, edición parcial de una
versión publicada ni múltiples shifts activos simultáneos en una misma sucursal cuando uno de ellos
está `PUBLISHED` o `IN_PROGRESS`.

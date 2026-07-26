# Especificación — SPEC-111 WorkShift

El nombre normativo es `WorkShift`; `Shift` queda sólo como alias coloquial. En I0 representa una
ventana laboral planificada por sucursal con `tenantId`, `branchId`, `timezone`, `businessDate`,
`startsAtUtc`, `endsAtUtc`, `laborPolicyVersion` y vínculo opcional `servicePeriodId`.

Lifecycle implementado: `DRAFT -> PUBLISHED -> IN_PROGRESS -> COMPLETED` y
`DRAFT|PUBLISHED -> CANCELLED`. Cada transición incrementa `revision`, actualiza `updatedAt` y
completa el timestamp correspondiente (`publishedAt`, `startedAt`, `completedAt`, `cancelledAt`).

Invariantes implementados:

- `startsAtUtc < endsAtUtc`.
- una sucursal no puede tener otro `WorkShift` activo incompatible en estado `PUBLISHED` o
  `IN_PROGRESS` al publicar o iniciar uno nuevo;
- no se puede cancelar un shift después de haber iniciado.

No están implementados en I0 los conceptos de capacidad, rol/capabilities requeridos, edición por
revisión de una versión publicada, políticas de solapamiento configurables ni derivación automática
desde `ServicePeriod`.

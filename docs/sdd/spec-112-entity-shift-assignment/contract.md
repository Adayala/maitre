# Contrato de entidad — SPEC-112 Shift Assignment

`ShiftAssignment` vincula un `Employment` con un `WorkShift` concreto. El contrato implementado
incluye:

- identidad y scope: `id`, `tenantId`, `branchId`, `workShiftId`, `employmentId`;
- atributos operativos: `roleCode`, `stationId?`;
- idempotencia básica: `createCommandId?`, `decisionCommandId?`;
- estado y concurrencia: `status`, `revision`;
- timestamps: `createdAt`, `updatedAt`, `confirmedAt?`, `declinedAt?`, `cancelledAt?`.

Estados válidos: `PROPOSED`, `CONFIRMED`, `DECLINED`, `CANCELLED`.

Transiciones válidas: `PROPOSED -> CONFIRMED|DECLINED|CANCELLED` y `CONFIRMED -> CANCELLED`.

El contrato actual garantiza:

- no duplicar asignaciones activas para el mismo `workShiftId + employmentId`;
- crear/reasignar sólo sobre employments activos y elegibles para la sucursal;
- cancelar la asignación previa al reasignar y crear una nueva con otro employment.

No forman parte del contrato I0 un historial detallado de actor/motivo, detección de conflictos por
política laboral, ni versionado fuerte para `If-Match` a nivel de entidad.

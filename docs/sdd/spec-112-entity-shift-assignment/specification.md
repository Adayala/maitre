# Especificación — SPEC-112 ShiftAssignment y autoridad de Employment

`Employment` sigue siendo la autoridad laboral para asignaciones: la autenticación o membership no
alcanza para demostrar elegibilidad operativa. En I0, `ShiftAssignment` vincula un `WorkShift` con
un `Employment` activo al inicio del turno y habilitado para la sucursal del shift.

Contrato operativo implementado:

- referencia a `tenantId`, `branchId`, `workShiftId`, `employmentId`;
- datos de asignación: `roleCode`, `stationId?`;
- control de idempotencia básica: `createCommandId?`, `decisionCommandId?`;
- lifecycle `PROPOSED -> CONFIRMED | DECLINED | CANCELLED`, con `CONFIRMED -> CANCELLED`;
- unicidad efectiva por par `workShiftId + employmentId` mientras la asignación previa no esté
  `DECLINED` o `CANCELLED`.

Validaciones implementadas al crear o reasignar:

- el shift debe existir y no puede estar `CANCELLED` ni `COMPLETED`;
- el employment debe existir;
- el employment debe estar activo en `shift.startsAtUtc`;
- el employment debe ser elegible para `shift.branchId`.

La reasignación actual cancela la asignación anterior y crea una nueva; opcionalmente puede dejarla
confirmada en la misma operación. No están implementados en I0 conflictos por `laborPolicyVersion`,
historial estructurado de motivos/actores ni integración con Membership/User más allá de la capa API.

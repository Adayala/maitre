# Structure — SPEC-050

Estructura lógica:

- identidad y scope: `occupancyId`, `tenantId`, `branchId`;
- relación: `visitId`, `tableId`;
- intervalo: `startedAt`, `endedAt?`, `status: ACTIVE | CLOSED`;
- asignación: `allocatedGuests`;
- control: `revision`, `createdBy`, `closedBy?`, reason codes y auditoría.

La capacidad pertenece a Table/CapacityPolicyVersion y no se copia como autoridad en
Occupancy. La persistencia debe imponer la exclusión de intervalos ACTIVE por Table y
preservar los intervalos cerrados.

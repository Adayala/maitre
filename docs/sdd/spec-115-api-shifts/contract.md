# Contrato API — SPEC-115 Shifts

La API materializada de `WorkShift` incluye:

- `POST /v1/branches/:branchId/work-shifts`
- `GET /v1/branches/:branchId/work-shifts`
- `GET /v1/work-shifts/:id`
- `POST /v1/work-shifts/:id/publish`
- `POST /v1/work-shifts/:id/start`
- `POST /v1/work-shifts/:id/complete`
- `POST /v1/work-shifts/:id/cancel`

El contrato actual garantiza:

- create con validación de intervalo y scope;
- list por branch con filtros `status`, `order`, `limit`, `offset`;
- detail con aislamiento por tenant/branch;
- commands de lifecycle protegidos por `If-Match` contra la `revision` actual;
- mapeo de errores `400` para input/header inválido, `404` para fuera de scope/inexistente y `409`
  para conflictos o transiciones inválidas.

No forman parte del contrato I0 un endpoint de update, replay idempotente por `Idempotency-Key`
para shifts, ni validaciones profundas de compliance o staffing al publicar/completar.

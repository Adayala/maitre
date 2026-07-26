# Especificación — SPEC-055 Visits API

Superficie I0:

- `POST /v1/visits`;
- `GET /v1/visits?branchId=...`;
- `GET /v1/visits/{visitId}`;
- `POST /v1/visits/{visitId}/request-close`;
- `POST /v1/visits/{visitId}/close`;
- `POST /v1/visits/{visitId}/cancel`;
- `POST /v1/visits/{visitId}/reopen`, exclusivamente como workflow correctivo manager.

No existe PATCH de status. Create y comandos usan `Idempotency-Key`; transiciones usan
`If-Match`. Seat/move/release posteriores se exponen únicamente por SPEC-056.
El I0 actual no exige todavía `Idempotency-Key` ni `If-Match`.

El seating inicial adquiere Occupancy con locks/constraints, no TableStatus. Request-close pasa a CLOSING;
close valida Check/payment/kitchen/occupancy. `409` exclusión/idempotencia, `412` revisión, `422`
transición. Reopen exige manager/reason y workflow correctivo.
El I0 actual usa body/query con `branchId` en lugar de rutas branch-scoped, responde `400`/`409`
según el caso y no distingue todavía `412`/`422` como contrato separado.

# Especificación — SPEC-073 Waitlist API

Superficie I0:

- `POST /v1/branches/{branchId}/waitlist-entries`;
- `GET /v1/branches/{branchId}/waitlist-entries`;
- `GET /v1/waitlist-entries/{entryId}`;
- `POST /v1/waitlist-entries/{entryId}/notify`;
- `POST /v1/waitlist-entries/{entryId}/seat`;
- `POST /v1/waitlist-entries/{entryId}/cancel`;
- `POST /v1/waitlist-entries/{entryId}/expire`;
- `POST /v1/waitlist-entries/{entryId}/priority-overrides`.

Add hoy no es idempotente por canal/request y crea `arrivedAt` server-side como base del orden.
Comandos todavía no requieren `Idempotency-Key` ni `If-Match`. List hoy devuelve el set completo
del Branch, ordenado por `priorityOverride DESC`, `arrivedAt ASC`, `id ASC`; no usa cursor ni
filtros allowlisted.

`notify` sólo hace la transición a `NOTIFIED`: no reserva capacidad ni espera al provider.
`seat` abre una `Visit` y luego la vincula al entry; el I0 actual no modela `CapacityAllocation`
ni garantiza una única transacción entre ambos pasos. Overrides de prioridad requieren el permiso
dedicado `waitlist:priority_override` de SPEC-080 y `reason` en body.

Los estados terminales no vuelven a `WAITING`. El I0 actual no minimiza/redacta campos en listas:
si existe `notes`, hoy viaja en la respuesta.

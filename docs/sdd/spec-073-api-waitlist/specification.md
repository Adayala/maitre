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

Add es idempotente por canal/request y crea arrivalSequence server-side. Comandos requieren
`Idempotency-Key` e `If-Match`. List usa cursor, status y partySize allowlisted sobre el orden
calculado por OrderingPolicyVersion; no acepta sort arbitrario.

`notify` crea NotificationIntent/outbox y transición NOTIFIED: no reserva capacidad ni espera
al provider. `seat` adquiere/confirma CapacityAllocation, revalida compatibilidad y crea/vincula
Visit en la misma transacción; reintentos
devuelven la Visit ya vinculada. Overrides de prioridad requieren permiso, reason code y audit.

Los estados terminales no vuelven a `WAITING`. Contacto y notas se minimizan y redactan en listas.

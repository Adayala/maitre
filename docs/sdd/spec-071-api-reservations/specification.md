# Especificación — SPEC-071 Reservations API

## Alcance

API tenant/branch-scoped para crear, consultar y ejecutar comandos sobre Reservation. No ofrece
`PATCH status`: cada transición es un comando con precondiciones explícitas.

## Operaciones

- `POST /v1/branches/{branchId}/reservations`: crea `PENDING`; requiere `Idempotency-Key`.
- `GET /v1/branches/{branchId}/reservations`: filtra por intervalo, status y cursor.
- `GET /v1/reservations/{reservationId}`: devuelve versión y PII según permiso.
- `POST /v1/reservations/{id}/confirm`: convierte un CapacityHold vigente en consumo confirmado.
- `POST /v1/reservations/{id}/cancel`: cancela y libera el consumo de capacidad atómicamente.
- `POST /v1/reservations/{id}/seat`: crea o vincula exactamente una Visit.
- `POST /v1/reservations/{id}/no-show`: registra `NO_SHOW`; exige permiso y reason code.

## Invariantes

Confirm y cancel bloquean Reservation + CapacityHold y escriben dominio + outbox en una única
transacción. Availability nunca es autoridad. Todos los comandos exigen `If-Match`; devuelven
`412` por versión, `409` por conflicto de capacidad/idempotencia y `422` por transición inválida.
Tenant y actor derivan de autenticación; un capability público tiene endpoint y scope separados.

El horario se expresa como `startAt` UTC, `timezone` IANA y `durationMinutes`. El contacto se
normaliza, cifra o protege según clasificación y nunca aparece en listados sin permiso PII.

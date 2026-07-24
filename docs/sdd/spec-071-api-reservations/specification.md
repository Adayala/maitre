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

Create confirma en la misma transacción un CapacityHold `HELD` con expiry explícita; si no
puede adquirirlo, no deja Reservation parcial. List acepta sólo intervalo, status, source y
cursor/límite acotados.

La superficie pública separada contiene:

- `POST /v1/public/branches/{publicBranchId}/reservations`;
- `GET /v1/public/reservations/{publicReservationId}`;
- `POST /v1/public/reservations/{publicReservationId}/confirm`;
- `POST /v1/public/reservations/{publicReservationId}/cancel`.

Detail/commands públicos exigen una capability opaca, ligada a Reservation/acciones/expiry,
transmitida fuera del body y almacenada sólo como hash. No existen list, seat ni no-show
públicos. Las respuestas públicas usan identificadores opacos y PII mínima.

## Invariantes

Confirm y cancel bloquean Reservation + CapacityHold y escriben dominio + outbox en una única
transacción. Availability nunca es autoridad. Todos los comandos exigen `If-Match`; devuelven
`412` por versión, `409` por conflicto de capacidad/idempotencia y `422` por transición inválida.
Tenant y actor derivan de autenticación interna; la capability pública resuelve tenant/Branch
sin aceptar esos campos del cliente.

El horario se expresa como `startAt` UTC, `timezone` IANA y `durationMinutes`. El contacto se
normaliza, cifra o protege según clasificación y nunca aparece en listados sin permiso PII.

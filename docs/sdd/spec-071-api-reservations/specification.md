# Especificación — SPEC-071 Reservations API

## Alcance

API tenant/branch-scoped para crear, consultar y ejecutar comandos sobre Reservation. No ofrece
`PATCH status`: cada transición es un comando con precondiciones explícitas.

I0 actual: sólo existe la superficie interna autenticada. La variante pública con capability
tokens, el ledger explícito de CapacityHold, el `If-Match` obligatorio y la idempotencia por
header quedan diferidos.

## Operaciones

- `POST /v1/branches/{branchId}/reservations`: crea `PENDING`.
- `GET /v1/branches/{branchId}/reservations`: filtra por `status`.
- `GET /v1/reservations/{reservationId}`: obtiene el detalle interno.
- `POST /v1/reservations/{id}/confirm`: revalida capacidad y pasa a `CONFIRMED`.
- `POST /v1/reservations/{id}/cancel`: pasa a `CANCELLED` y registra `reasonCode`.
- `POST /v1/reservations/{id}/seat`: abre una `Visit` y la vincula; luego pasa a `SEATED`.
- `POST /v1/reservations/{id}/no-show`: registra `NO_SHOW` con razón textual.

Create no reserva capacidad todavía: en este I0 una Reservation `PENDING` no bloquea inventario.
La capacidad se asigna recién al confirmar, eligiendo una sola mesa compatible dentro del Branch.
List no expone todavía intervalo, cursor ni `source`.

## Invariantes

Confirm revalida capacidad contra otras reservations `CONFIRMED`/`SEATED` del mismo Branch y
devuelve `409` cuando no encuentra mesa compatible. Cancel, confirm y create escriben outbox;
seat/no-show hoy sólo actualizan estado.

Un salón activo sin mesas no impide crear una reserva `PENDING`, pero sí impide confirmarla:
`confirm` devuelve `409` y, al no existir una reserva `CONFIRMED`, `seat` también devuelve `409`
sin crear una Visit. La capacidad declarada del salón no reemplaza una asignación de mesa.

Tenant y actor derivan de autenticación interna. El horario se modela con `startAt` y
`durationMinutes`; no hay todavía tratamiento explícito de `timezone` IANA/DST. El modelo
acepta `guestId`, `source`, `cancellationPolicyId` y `notes`, pero el route I0 sólo exige
party size y ventana horaria.

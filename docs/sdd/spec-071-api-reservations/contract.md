# Contrato API — SPEC-071 Reservations

Crear/listar/obtener y ejecutar confirm/cancel/seat/no-show sobre Reservation. Create recibe
branch, horario y party size; tenant deriva del contexto autenticado. Confirmación revalida
capacidad y asigna una mesa simple; seating abre/vincula una Visit una sola vez. I0 no expone
surface pública, no exige `If-Match` ni `Idempotency-Key`, y list sólo filtra por `status`.
Tests cubren lifecycle interno, permisos, 404, waitlist relacionado y notification intents.

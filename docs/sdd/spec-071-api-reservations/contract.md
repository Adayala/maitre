# Contrato API — SPEC-071 Reservations

Crear/listar/obtener y ejecutar confirm/cancel/seat/no-show sobre Reservation. Create recibe
branch, horario, party size y contacto mínimo; tenant deriva del canal/contexto e
Idempotency-Key evita duplicados. Commands usan If-Match y reason codes. Confirmación
revalida capacidad atómicamente; seating enlaza Visit una vez. Tests cubren concurrencia,
timezone/DST, reintento, PII, canales público/interno y cross-tenant.

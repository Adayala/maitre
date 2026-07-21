# Contrato — SPEC-066 Reservation

Reservation es compromiso de capacidad para Branch y horario. Campos: party size, guest,
start/duration, table preferences/assignments, source, status `PENDING | CONFIRMED | SEATED |
CANCELLED | NO_SHOW | COMPLETED`, version y auditoría. Disponibilidad se valida al confirmar,
no sólo al crear. Idempotencia evita duplicados por canal. Seating vincula Visit una vez;
cancel/no-show conservan historia y motivo. Tests cubren capacidad concurrente, timezone/DST,
reconfirmación, cross-tenant y PII mínima.

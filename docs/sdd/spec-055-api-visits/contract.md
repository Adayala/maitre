# Contrato API — SPEC-055 Visits

Rutas para abrir/listar/obtener y ejecutar comandos de lifecycle sobre Visit. `POST
/v1/branches/{branchId}/visits` recibe guestCount, tableIds iniciales y Reservation opcional;
tenant/actor provienen del contexto e `Idempotency-Key` evita doble apertura. El seating
inicial crea Visit y Occupancies atómicamente. Los cambios posteriores de mesa pertenecen a
SPEC-056. Lifecycle usa endpoints de comando con `If-Match`, no PATCH arbitrario. `404`
oculta cross-tenant, `409` conflictos, `412` revisión y `422` transición. Tests cubren doble
seating inicial, close, RBAC, idempotencia y auditoría.

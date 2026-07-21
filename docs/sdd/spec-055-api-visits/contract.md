# Contrato API — SPEC-055 Visits

Rutas para abrir/listar/obtener y ejecutar comandos sobre Visit. `POST /v1/visits` recibe
branch, guestCount, tableIds y reservation opcional; tenant/actor vienen del contexto e
Idempotency-Key evita doble apertura. Cambios de status/table usan endpoints de comando con
If-Match, no PATCH arbitrario. `404` oculta cross-tenant, `409` mesa/visita concurrente,
`412` versión y `422` transición. Tests cubren double seating, move, close, RBAC y auditoría.

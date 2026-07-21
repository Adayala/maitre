# Contrato API — SPEC-128 Cash Register

Listar cajas y ejecutar open/suspend/resume/close mediante comandos explícitos e idempotentes.
Open registra fondo inicial y responsable; close exige conteo y dispara reconciliación sin
ocultar diferencias. If-Match evita transiciones concurrentes y toda excepción requiere motivo.
Tests cubren doble apertura, cambio de turno, caja con pagos pendientes, reintentos, moneda,
RBAC, auditoría y aislamiento entre sucursales.

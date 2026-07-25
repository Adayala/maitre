# Contrato API — SPEC-117 Time Tracking

Ejecutar clock-in/clock-out y solicitar o aprobar ajustes de jornadas mediante comandos
idempotentes. El servidor fija timestamps confiables, conserva la marca informada por el
dispositivo y registra fuente y desfase; no permite editar registros históricos directamente.
Tests cubren conexión intermitente, reintentos, reloj del cliente alterado, doble marcación,
DST, aprobación segregada, RBAC, auditoría y aislamiento entre tenants.

La separación de acceso implica que self-access puede consultar únicamente sus propios `TimeEntry`
y `TimeAdjustment`, mientras supervisor access requiere permiso sensible y scope válido para vistas
completas. En self-access, `TimeAdjustment` redacta `requesterId`, `approverId` y `evidence`.

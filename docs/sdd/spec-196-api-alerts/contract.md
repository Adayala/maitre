# Contrato API — SPEC-196 Alerts

Administrar reglas y ejecutar acknowledge/resolve/snooze sobre activaciones versionadas. Preview
muestra incidencias históricas sin enviar notificaciones; comandos son idempotentes y auditados.
Tests cubren tormentas, cooldown, snooze, datos tardíos, canales fallidos, RBAC, concurrencia y
aislamiento.

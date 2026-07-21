# Contrato API — SPEC-130 Reconciliation

Obtener el resumen esperado, cargar conteos y ejecutar submit/approve/reject sobre una
reconciliación versionada. El servidor recalcula diferencias desde el ledger, no acepta totales
esperados del cliente y exige motivo para ajustes o rechazo. Tests cubren pagos tardíos,
conteos repetidos, concurrencia, reapertura controlada, segregación de funciones, precisión
decimal, RBAC, auditoría y aislamiento entre tenants.

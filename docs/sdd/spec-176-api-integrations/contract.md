# Contrato API — SPEC-176 Integrations

Crear, listar, obtener, configurar, activar, desactivar y actualizar conectores. Configuración
se valida server-side por provider y versión; secretos se reciben por canal dedicado y se
convierten en referencias sin volver a mostrarse. Idempotency-Key e If-Match protegen cambios.
Tests cubren schema inválido, upgrade, capability flags, concurrencia, RBAC, redacción,
auditoría y aislamiento entre tenants.

# Contrato RBAC — SPEC-186 Integrations

Separar permisos para consultar estado, configurar, autorizar OAuth, probar, sincronizar,
rotar credenciales y administrar webhooks. La autorización combina rol, tenant, sucursal y
sensibilidad; secretos no son legibles por ningún rol y acciones críticas requieren auditoría.
Tests matriciales cubren operator, manager, integration admin y tenant admin, escalamiento
horizontal y vertical, segregación, revocación y sesiones existentes.

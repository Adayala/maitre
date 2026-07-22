# Contrato RBAC — SPEC-186 Integrations

Separar permisos para consultar estado, configurar, autorizar OAuth, probar, sincronizar,
rotar credenciales y administrar webhooks. La autorización combina rol, tenant, sucursal y
sensibilidad; secretos no son legibles por ningún rol y acciones críticas requieren auditoría.
`operator`, `integration admin` y `tenant admin` son assignments de permisos, no roles locales.
Tests cubren escalamiento, segregación, revocación y sesiones existentes.

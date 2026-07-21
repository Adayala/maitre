# Contrato RBAC — SPEC-036

OWNER consulta Subscription/Entitlements y solicita cambios permitidos; ADMIN consulta y
puede gestionar sólo si posee permiso explícito; MANAGER consulta capacidades operativas
necesarias, no términos comerciales; demás roles consumen decisiones de entitlement sin
ver configuración comercial.

Provisionar, suspender o cancelar requiere rol de plataforma separado, no un rol tenant
autoasignable. Ningún actor edita Entitlements/Quotas derivados. Tests cubren self-grant,
cross-tenant, datos comerciales minimizados, plataforma impersonation y auditoría de toda
mutación sensible.

# Contrato RBAC — SPEC-109 Kitchen

Separar permisos para ver colas, reclamar producción, cambiar estados, administrar estaciones
y gestionar o escalar alertas. La autorización combina rol, tenant, sucursal, estación y
turno activo; toda denegación es segura y las excepciones requieren motivo auditable. Tests
matriciales cubren kitchen operator, expediter, waiter, manager y admin, escalamiento horizontal
y vertical, reasignación y revocación inmediata.

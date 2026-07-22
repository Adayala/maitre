# Contrato RBAC — SPEC-171 Feedback

Separar permisos para enviar, leer contenido, gestionar casos, redactar, consultar agregados y
administrar integraciones. La autorización combina rol, tenant, sucursal, ownership y nivel de
sensibilidad; texto y PII se deniegan por defecto y toda exportación queda auditada. Tests
matriciales cubren customer, staff, manager, reputation analyst y admin, escalamiento horizontal
y vertical, supresión y revocación inmediata.

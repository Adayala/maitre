# Contrato RBAC — SPEC-171 Feedback

Separar permisos para enviar, leer contenido, gestionar casos, redactar, consultar agregados y
administrar integraciones. La autorización combina rol, tenant, sucursal, ownership y nivel de
sensibilidad; texto y PII se deniegan por defecto y toda exportación queda auditada. GUEST usa
capability y `customer`, `staff` o `reputation analyst` no son roles locales: reciben permisos
canónicos. Tests cubren escalamiento, supresión y revocación inmediata.

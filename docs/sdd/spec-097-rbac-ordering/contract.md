# Contrato RBAC — SPEC-097 Ordering

Definir permisos separados para leer, crear, enviar, modificar, cancelar y marcar estados de
órdenes, además de excepciones sobre ítems ya preparados. Autorización combina rol, tenant,
sucursal, turno y ownership; toda denegación es segura y toda operación sensible queda
auditada con actor y motivo. Tests matriciales cubren customer, waiter, kitchen, cashier,
manager y admin, escalamiento horizontal y vertical, y revocación inmediata.

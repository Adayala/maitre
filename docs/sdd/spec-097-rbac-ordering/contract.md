# Contrato RBAC — SPEC-097 Ordering

Definir permisos separados para leer, crear, enviar, modificar, cancelar y marcar estados de
órdenes, además de excepciones sobre ítems ya preparados. Autorización combina roles canónicos,
tenant, sucursal, turno y ownership: WAITER, COOK, CASHIER y MANAGER reciben assignments
versionados; el público usa capability y no un rol `customer`. Toda operación sensible queda
auditada. Tests matriciales cubren permisos, escalamiento y revocación inmediata.

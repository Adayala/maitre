# Contrato RBAC — SPEC-135 Cash

Separar permisos para abrir caja, registrar movimientos, contar, enviar, aprobar diferencias,
administrar descuentos y consultar cierres. La autorización combina rol, tenant, sucursal,
sesión y ownership; operaciones de alto riesgo aplican segregación y límites configurables.
Tests matriciales cubren cashier, supervisor, manager, finance y admin, autoaprobación,
escalamiento horizontal y vertical, y revocación inmediata.

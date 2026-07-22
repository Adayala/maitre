# Especificación — SPEC-131 Discounts API

CRUD de DRAFT, publish/version/deactivate, evaluate y command `apply`. Sólo roles de policy pueden
publicar; operadores aplican versiones ya publicadas. Evaluate es explicable y no reserva uso.

Apply revalida Check/Order revision, eligibility, stacking, caps y usage dentro de una transacción,
calcula server-side y crea DiscountApplication + actualización de Check + outbox. Override requiere
permiso separado, reason y approval threshold. Importes del cliente se rechazan.

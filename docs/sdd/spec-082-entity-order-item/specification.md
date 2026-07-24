# Especificación — SPEC-082 OrderItem

OrderItem es la unidad autoritativa de fulfillment. Captura product ID, catalog revision, nombre,
quantity, moneda, precio neto/bruto, tax category/rate version, modifiers y restricciones como
snapshot inmutable al submit.

Lifecycle: `QUEUED -> IN_PREP -> READY -> DELIVERED`; `CANCELLED` es terminal. Cumplimiento parcial
divide cantidades en allocations cuya suma conserva la quantity original. Cada transición usa
expected revision y timestamp del servidor.

Cancelación genera OrderAdjustment con quantity, importe firmado, motivo, actor y vínculos a
Kitchen/Check. Si producción comenzó registra waste y exige permiso; si existe pago genera saldo o
refund pendiente mediante el dominio correspondiente. Nunca borra el item ni muta su snapshot.

Cada OrderItem pertenece exactamente a un Order y hereda su scope `tenantId`, `brandId`,
`branchId`, `visitId` y `orderId`. `productId` y `catalogRevisionId` son referencias históricas,
no dependencias mutables. El snapshot congelado incluye display name, base unit, sales channel
permitido, tax treatment, money exacto, allergen/safety codes tipados, modifier snapshots y notas
operativas permitidas.

`quantity` es positiva y exacta según la unidad comercial aprobada por catálogo. Fulfillment parcial
se representa con allocations o sub-unidades operativas cuya suma siempre coincide con la quantity
original menos cancelado terminal. No se permiten cantidades fantasmas, negativas ni duplicadas.

Las transiciones operativas válidas son monotónicas: `QUEUED -> IN_PREP -> READY -> DELIVERED` o
`QUEUED|IN_PREP|READY -> CANCELLED` según policy y permisos. Eventos repetidos o fuera de orden se
deduplican por revisión/command id y jamás hacen retroceder un item terminal. La preparación parcial
debe converger al mismo estado final con replay.

OrderItem no puede repricearse silenciosamente después de submit. Un cambio de producto, modifier,
quantity o precio genera un nuevo item o un ajuste compensatorio auditado con `reasonCode`,
`actorType`, referencias a KitchenTicket/Check y timestamps del servidor. El snapshot original
permanece consultable para auditoría.

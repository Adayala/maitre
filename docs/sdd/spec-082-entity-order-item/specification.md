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

# Contrato API — SPEC-131 Discounts

El contrato materializado en I0 permite crear, listar, publicar y desactivar descuentos, evaluar
el monto server-side y registrar una `DiscountApplication` sobre un `Order` o `Check`. La API no
confía en un monto aplicado calculado por el cliente.

Versionado de nuevas policies, stacking, caps, usage limits, overrides y actualización transaccional
del total de `Order`/`Check` pertenecen al engine avanzado diferido. No se presentan como garantías
del surface I0.

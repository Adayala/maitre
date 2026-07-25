# Contrato API — SPEC-089 Order Modifications

Agregar, cancelar o cambiar cantidades después del submit se hace mediante comandos dedicados.
El I0 actual cubre `change-quantity` y cancelación simplificada por ítem completo; no expone
`replace-modifiers` ni estados intermedios de saga. Cada modificación registra actor, motivo y
delta monetario en `adjustments`; las cancelaciones sobre ítems ya en producción requieren permiso
elevado. Tests cubren lifecycle básico, cancelación, `change-quantity`, RBAC de excepciones y
trazabilidad simple. Tax recalc fino, compensaciones y retries complejos siguen diferidos.

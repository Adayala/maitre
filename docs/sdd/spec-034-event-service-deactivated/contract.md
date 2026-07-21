# Contrato del evento — SPEC-034

Evento `subscription.service.deactivated.v1` tras desactivación confirmada. Payload:
tenantId, subscriptionId, itemId, serviceCode, scopes afectados, effectiveAt, reasonCode y
calculation revision. No incluye texto sensible ni información de pago.

Consumidores invalidan proyecciones/caches idempotentemente y fallan cerrado para nuevas
acciones; la retirada de datos/operaciones en curso sigue contratos propios. Tests cubren
duplicados, reordenamiento con activated, retry/DLQ y convergencia por revisión.

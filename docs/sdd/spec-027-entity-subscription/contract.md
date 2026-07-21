# Contrato — SPEC-027 Subscription

Subscription expresa qué servicios solicita un Tenant; no es factura ni credencial. En el
MVP gratuito se provisiona administrativamente y no ejecuta cobros.

Campos: `id`, `tenantId`, `status` (`TRIAL | ACTIVE | SUSPENDED | CANCELLED`), período,
items, versión y auditoría. Tenant posee como máximo una subscription vigente por contexto
comercial. Status no elimina datos ni revoca derechos por sí solo: los entitlements se
recalculan de forma determinista por SPEC-035.

Transiciones requieren motivo, actor y concurrencia. `CANCELLED` es terminal; reactivación
crea nueva Subscription. Tests cubren unicidad vigente, fechas, suspensión/cancelación,
tenant isolation y ausencia de side effects de pago.

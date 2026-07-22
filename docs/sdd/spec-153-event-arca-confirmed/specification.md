# Especificación — SPEC-153 FiscalAuthorizationResolved

Evento técnico `fiscal.authorization.resolved.v1` para cerrar una operación externa directa o
ambigua. Incluye operation/invoice IDs, provider, environment, outcome AUTHORIZED|REJECTED,
normalized codes, resolvedAt y causation; omite SOAP, credentials y PII.

Si outcome AUTHORIZED, la misma transacción cambia Invoice y emite SPEC-152. Consumidores
contables ignoran este evento técnico para evitar doble contabilización.

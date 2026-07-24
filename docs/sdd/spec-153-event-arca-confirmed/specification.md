# Especificación — SPEC-153 FiscalAuthorizationResolved

Evento técnico `fiscal.authorization.resolved.v1` para cerrar una operación externa directa o
ambigua. Incluye operation/invoice IDs, provider, environment, outcome AUTHORIZED|REJECTED,
normalized codes, resolvedAt y causation; omite SOAP, credentials y PII.

Si outcome AUTHORIZED, la misma transacción cambia Invoice y emite SPEC-152. Consumidores
contables ignoran este evento técnico para evitar doble contabilización.

Este evento está orientado a observabilidad, integraciones operativas y troubleshooting. Permite
correlacionar intentos, tiempos de resolución y códigos del proveedor sin contaminar el stream de
hechos contables. Su deduplicación se basa en la identidad de la operación externa y en la revisión de
resolución persistida.

Si una misma operación pasa de `PENDING_RECONCILIATION` a `AUTHORIZED` o `REJECTED`, SPEC-153 se
publica al resolverse el estado. Cuando la resolución implica autorización efectiva, SPEC-152 es el
hecho funcional que deben usar cash, export y reporting financiero.

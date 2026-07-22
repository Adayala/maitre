# Contrato de evento — SPEC-153 ARCA Confirmed

Publicar al confirmar por respuesta o consulta posterior el resultado fiscal de una intención
ambigua. El sobre versionado identifica eventId, occurredAt, tenantId, invoiceId, operación,
outcome y códigos normalizados, sin payload SOAP, credenciales ni PII. Tests cubren timeout y
consulta, rechazo, mensajes duplicados o tardíos, evolución compatible, redacción,
correlación y deduplicación.

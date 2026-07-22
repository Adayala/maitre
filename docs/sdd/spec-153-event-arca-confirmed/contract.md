# Contrato de evento — SPEC-153 FiscalAuthorizationResolved

Publicar `fiscal.authorization.resolved.v1` como hecho técnico al resolver por respuesta o consulta el resultado de una intención
ambigua. El sobre versionado identifica eventId, occurredAt, tenantId, invoiceId, operación,
outcome y códigos normalizados, sin payload SOAP, credenciales ni PII. Tests cubren timeout y
consulta, rechazo, mensajes duplicados o tardíos, evolución compatible, redacción,
correlación y deduplicación.

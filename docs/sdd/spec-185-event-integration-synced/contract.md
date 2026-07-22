# Contrato de evento — SPEC-185 IntegrationSynced

Publicar al finalizar una ejecución de sincronización completa, parcial o fallida. El sobre
versionado incluye eventId, occurredAt, tenantId, integrationId, runId, direction, outcome,
cursor version, conteos y duración, sin payloads ni secretos. Tests cubren reintentos, ejecución
parcial, mismo cursor, duplicados, compatibilidad, correlación, redacción y aislamiento.

# Contrato API — SPEC-178 Webhooks

Administrar suscripciones y recibir webhooks de providers con verificación de firma sobre bytes
crudos, timestamp, tolerancia temporal y deduplicación. La recepción responde rápido y deriva
procesamiento a cola/outbox; errores permanentes van a dead-letter auditable. Tests cubren
firma inválida, replay, payload grande, orden, duplicados, rotación, SSRF, rate limit y
aislamiento entre tenants.

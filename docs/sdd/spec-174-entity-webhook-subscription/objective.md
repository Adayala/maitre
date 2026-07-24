# Objetivo — SPEC-174

Definir el modelo de webhooks inbound y outbound con secretos, retries y permisos completamente
separados.

## Criterios de aceptación

### CAD-174-01 — Inbound y outbound quedan separados en secretos, IDs, retries y permisos

outbound e inbound se modelan como entidades distintas con secretos, IDs, retries y
permisos no compartidos.

### CAD-174-02 — `OutboundWebhookSubscription` define endpoint, allowlist, filtros y retry policy

`OutboundWebhookSubscription` define endpoint, allowlist de eventos, filtros, signing
secret ref, delivery/retry policy y lifecycle.

### CAD-174-03 — `ProviderWebhookEndpoint` define route identity, verification ref y schema limits

`ProviderWebhookEndpoint` define provider/integration capability, route identity,
verification secret ref, schema limits y status.

### CAD-174-04 — Outbound aplica SSRF controls; inbound verifica firma, timestamp y replay

outbound aplica SSRF controls en cada delivery; inbound verifica firma sobre raw bytes,
timestamp y replay antes de encolar.

### CAD-174-05 — Deliveries y receipts preservan evidencia sin mezclar semánticas

deliveries y receipts preservan attempt/outcome/DLQ o replay identity sin mezclar
semánticas entre inbound y outbound.

### CAD-174-06 — La aprobación exige evidencia de firma, replay, SSRF y schema limits

La aprobación exige fixtures de firma, replay, SSRF controls, retry/DLQ, separación de
secretos y schema limits.

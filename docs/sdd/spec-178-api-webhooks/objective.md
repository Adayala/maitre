# Objetivo — SPEC-178

Definir las APIs de webhooks con separación clara entre management outbound y recepción inbound, bajo
controles de SSRF, firma y replay.

## Criterios de aceptación

### CAD-178-01 — Outbound management e inbound receipt viven en APIs separadas

management outbound y receipt inbound se modelan como APIs separadas.

### CAD-178-02 — Outbound aplica SSRF controls completos y revalida redirects

outbound create/update valida HTTPS, allowlists de hostname/port, DNS/IP por conexión y
bloqueo de private/link-local/metadata con redirects revalidados.

### CAD-178-03 — Test delivery usa payload sintético, límites y budget explícitos

test delivery usa payload sintético, límites y budget explícitos.

### CAD-178-04 — Inbound valida endpoint, raw signature, timestamp y replay antes de procesar

inbound identifica `ProviderWebhookEndpoint`, limita body, verifica raw
signature/timestamp/replay y persiste Receipt antes del procesamiento async.

### CAD-178-05 — Deduplicación por provider event ID y DLQ manejan fallos permanentes

processing async deduplica por provider event ID y fallos permanentes van a DLQ auditable.

### CAD-178-06 — La aprobación exige evidencia de SSRF, firma, replay y tenant resolution segura

La aprobación exige fixtures de SSRF, firma, replay, deduplicación, DLQ y garantía de que
tenant no se elige desde payload.

# Verificación — SPEC-174

## Criterios

### CAD-174-01 — Inbound y outbound quedan separados en secretos, IDs, retries y permisos

- [ ] inbound y outbound quedan separados en secretos, IDs, retries y permisos.

### CAD-174-02 — `OutboundWebhookSubscription` define endpoint, allowlist, filtros y retry policy

- [ ] outbound define endpoint, allowlist, filtros, secret ref y retry policy.

### CAD-174-03 — `ProviderWebhookEndpoint` define route identity, verification ref y schema limits

- [ ] inbound define route identity, verification secret ref y schema limits.

### CAD-174-04 — Outbound aplica SSRF controls; inbound verifica firma, timestamp y replay

- [ ] SSRF controls y verificación de firma/replay se aplican correctamente.

### CAD-174-05 — Deliveries y receipts preservan evidencia sin mezclar semánticas

- [ ] deliveries y receipts preservan evidencia sin mezclar semánticas.

### CAD-174-06 — La aprobación exige evidencia de firma, replay, SSRF y schema limits

- [ ] fixtures cubren firma, replay, SSRF, retry/DLQ y límites de schema.

# Especificación — SPEC-174 Inbound/Outbound Webhooks

`OutboundWebhookSubscription`: tenant endpoint, event allowlist, filters, signing secret ref,
delivery/retry policy y lifecycle. `OutboundWebhookDelivery` conserva attempt/outcome/DLQ.

`ProviderWebhookEndpoint`: provider/integration capability, route identity, verification secret ref,
schema limits y status. `ProviderWebhookReceipt` conserva provider event ID, raw-body hash,
verifiedAt, outcome y replay identity. No comparten secrets, IDs, retry ni permisos.

Outbound URL aplica SSRF controls en cada delivery; inbound verifica firma sobre raw bytes,
timestamp y replay antes de encolar.

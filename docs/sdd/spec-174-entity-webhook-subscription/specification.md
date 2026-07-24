# Especificación — SPEC-174 Inbound/Outbound Webhooks

`OutboundWebhookSubscription`: tenant endpoint, event allowlist, filters, signing secret ref,
delivery/retry policy y lifecycle. `OutboundWebhookDelivery` conserva attempt/outcome/DLQ.

`ProviderWebhookEndpoint`: provider/integration capability, route identity, verification secret ref,
schema limits y status. `ProviderWebhookReceipt` conserva provider event ID, raw-body hash,
verifiedAt, outcome y replay identity. No comparten secrets, IDs, retry ni permisos.

Outbound URL aplica SSRF controls en cada delivery; inbound verifica firma sobre raw bytes,
timestamp y replay antes de encolar.

La entidad outbound incluye `subscriptionId`, `tenantId`, `targetUrl`, `eventAllowlist`, `filters`,
`signingSecretRef`, `retryPolicy`, `status`, `createdAt`, `updatedAt` y `revision`. La entidad inbound
incluye `endpointId`, `integrationId`, `provider`, `routeIdentity`, `verificationSecretRef`,
`schemaLimits`, `status`, `createdAt`, `updatedAt` y `revision`.

Los registros de delivery/receipt son evidencia operativa y no otorgan autoridad para reejecutar
acciones fuera de policy. El replay detection inbound debe apoyarse en identidad del evento y ventana
temporal, mientras que outbound debe registrar outcome y DLQ sin intentar entregas infinitas.

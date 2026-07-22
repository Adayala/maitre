# Contrato de entidad — SPEC-174 Inbound/Outbound Webhooks

OutboundWebhookSubscription/Delivery define endpoint tenant, eventos, firma y retries.
ProviderWebhookEndpoint/Receipt define recepción, firma raw-body, replay y procesamiento de
providers. No comparten secrets, IDs, lifecycle ni permisos. Outbound valida SSRF en cada conexión;
inbound deduplica receipts. Tests cubren DNS rebinding, replay, rotación, DLQ y aislamiento.

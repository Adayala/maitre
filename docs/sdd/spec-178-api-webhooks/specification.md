# Especificación — SPEC-178 Webhooks API

Management outbound y receipt inbound son APIs separadas. Outbound create/update valida HTTPS,
hostname/port allowlist, DNS/IP en cada conexión, bloqueo private/link-local/metadata y redirects
revalidados; test delivery usa payload sintético y budget.

Inbound identifica ProviderWebhookEndpoint, limita body, verifica raw signature/timestamp/replay,
persiste Receipt y responde rápido. Processing async deduplica por provider event ID; fallos
permanentes van a DLQ auditable. Nunca permite elegir tenant desde payload.

# Especificación — SPEC-178 Webhooks API

Management outbound y receipt inbound son APIs separadas. Outbound create/update valida HTTPS,
hostname/port allowlist, DNS/IP en cada conexión, bloqueo private/link-local/metadata y redirects
revalidados; test delivery usa payload sintético y budget.

Inbound identifica ProviderWebhookEndpoint, limita body, verifica raw signature/timestamp/replay,
persiste Receipt y responde rápido. Processing async deduplica por provider event ID; fallos
permanentes van a DLQ auditable. Nunca permite elegir tenant desde payload.

`/webhooks/outbound` expone create/update/list/test para suscripciones salientes; `/webhooks/inbound`
o rutas provider-specific sólo reciben eventos firmados. La resolución de tenant/integration inbound
deriva exclusivamente de endpoint identity/configuración, nunca de campos declarados por el payload.

La recepción responde rápido una vez verificada la autenticidad mínima y persistida la evidencia
necesaria. El procesamiento profundo ocurre async. Los errores distinguen config inválida, firma
inválida, replay, schema excedido y endpoint desconocido sin filtrar secretos ni detalles explotables.

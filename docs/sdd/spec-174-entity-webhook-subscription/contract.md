# Contrato de entidad — SPEC-174 Webhook Subscription

WebhookSubscription define endpoint HTTPS, eventos permitidos, referencia de secreto, versión
de firma, filtros, estado y política de entrega. El endpoint se valida contra SSRF y la rotación
admite solapamiento controlado de secretos. Tests cubren URLs privadas, DNS rebinding, eventos
desconocidos, rotación, pausa, reactivación, permisos, auditoría y aislamiento entre tenants.

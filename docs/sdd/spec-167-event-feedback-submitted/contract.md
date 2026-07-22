# Contrato de evento — SPEC-167 FeedbackSubmitted

Publicar mediante outbox al aceptar feedback. El sobre versionado incluye eventId, occurredAt,
tenantId, branchId, feedbackId, canal, dimensiones presentes y consent flags, sin texto, PII ni
token público. Consumidores deduplican por eventId. Tests cubren anonimato, rollback, reintento,
duplicados, compatibilidad, correlación, redacción y aislamiento entre tenants.

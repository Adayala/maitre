# Contrato de entidad — SPEC-159 External Review

ExternalReview conserva un snapshot normalizado de una reseña pública con plataforma,
externalId, ubicación, rating, texto permitido, autor redactado, URL, timestamps y estado.
La clave plataforma+externalId es idempotente y las actualizaciones mantienen historial y
provenance. Tests cubren duplicados, edición y borrado remoto, timezone, datos faltantes,
retención, términos del proveedor y aislamiento entre tenants.

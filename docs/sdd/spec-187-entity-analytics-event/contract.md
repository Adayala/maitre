# Contrato de entidad — SPEC-187 Analytics Event

Evento append-only con eventId, tenant, sucursal, tipo, versión, occurredAt, receivedAt,
subject seudónimo y propiedades allowlisted. No contiene secretos ni PII libre; deduplica por
eventId y conserva provenance. Tests cubren schema, eventos tardíos, reloj, duplicados,
retención, redacción y aislamiento.

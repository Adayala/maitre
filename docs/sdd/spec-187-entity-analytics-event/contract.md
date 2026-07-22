# Contrato de entidad — SPEC-187 Analytics Event

Evento append-only validado contra DataRegistry versionado de schemas, producers, classification,
lineage y retention, con eventId, tenant, sucursal, tipo, versión, occurredAt, receivedAt,
subject seudónimo y propiedades allowlisted. No contiene secretos ni PII libre; deduplica por
eventId y conserva provenance. Tests cubren schema, eventos tardíos, reloj, duplicados,
retención, redacción y aislamiento.

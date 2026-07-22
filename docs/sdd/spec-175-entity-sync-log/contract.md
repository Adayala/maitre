# Contrato de entidad — SPEC-175 Sync Log

SyncLog registra cada ejecución o lote con integración, dirección, cursor, conteos, timestamps,
outcome y errores normalizados. Es append-only, no almacena payloads completos ni secretos y
enlaza reintentos mediante correlationId. Tests cubren ejecución parcial, cursor, reintento,
redacción, retención, grandes volúmenes, observabilidad y aislamiento entre tenants.

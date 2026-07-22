# Contrato transversal — SPEC-215 HTTP API Standards

APIs `/v1` usan HTTPS, JSON, OpenAPI desde schemas, RFC 9457, cursores, ETag/If-Match e
Idempotency-Key según operación. Tenant y sucursal derivan de identidad autorizada, no del
payload. Errores no filtran internos y correlation IDs atraviesan capas. Contract tests cubren
compatibilidad, límites, content types, reintentos, concurrencia, auth y aislamiento.

# Contrato API — SPEC-199 Reports

Solicitar reportes versionados por período, sucursal, timezone y formato; generación asíncrona
produce manifest, parámetros, freshness y hash. Descargas firmadas expiran y respetan
supresiones. Tests cubren grandes períodos, datos tardíos, reintento, CSV injection, permisos,
retención, reconciliación y aislamiento.

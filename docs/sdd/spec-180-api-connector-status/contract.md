# Contrato API — SPEC-180 Connector Status

Consultar salud, última sincronización, freshness, credencial, cuota y errores normalizados por
integración y capacidad. El estado se deriva de señales con timestamps, no ejecuta checks caros
en cada lectura y redacta detalles sensibles. Tests cubren datos stale, provider caído,
credencial expirada, rate limit, caché, permisos, degradación parcial y aislamiento.

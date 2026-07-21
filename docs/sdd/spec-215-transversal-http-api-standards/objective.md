# Objetivo — SPEC-215

Evitar contratos incompatibles entre dominios y permitir que web, futuras apps, integraciones y tests compartan una única interpretación de requests, respuestas, errores y reintentos.

## Resultados esperados

- APIs predecibles sin conocimiento interno del backend.
- Autorización multi-tenant verificable en cada operación.
- Errores accionables para usuario, cliente y observabilidad.
- Reintentos seguros bajo desconexiones o timeouts.
- Evolución compatible y drift OpenAPI bloqueado por CI.
- Convenciones implementadas una vez en tooling, no copiadas por endpoint.

## Fuera de alcance

- Definir payloads funcionales de cada dominio.
- Exponer directamente tablas Supabase.
- Adoptar GraphQL, gRPC o un API gateway durante el MVP.
- Garantizar idempotencia de integraciones externas que no la soporten; el adapter debe compensarla localmente.

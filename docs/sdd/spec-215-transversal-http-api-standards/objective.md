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

## Criterios de aceptación

### CAD-215-01 — Las APIs HTTP comparten una semántica única de rutas, requests, respuestas y versiones

Los endpoints usan HTTPS, JSON, `/v1` y OpenAPI generado desde contratos ejecutables. La semántica base no se redefine por dominio salvo excepción aprobada.

### CAD-215-02 — La autorización multi-tenant se valida server-side en cada operación

Tenant y branch context siempre se derivan y validan contra autorización efectiva. Inputs manipulados por el cliente no pueden ampliar alcance.

### CAD-215-03 — Problem Details y contratos de error son consistentes, accionables y seguros

Los errores siguen `application/problem+json` y distinguen autenticación, autorización, conflicto, precondición y validación sin filtrar secretos ni detalles sensibles.

### CAD-215-04 — Idempotencia y concurrencia se gobiernan explícitamente en comandos críticos

Los comandos reintentables usan idempotency key y/o control de concurrencia explícito. Requests duplicados o stale no pueden producir efectos ambiguos o dobles.

### CAD-215-05 — Paginación, evolución y compatibilidad se gobiernan desde contratos versionados

Las colecciones mutables usan cursor estable por defecto y los cambios incompatibles se bloquean o versionan explícitamente. El drift entre schemas y OpenAPI falla en CI.

### CAD-215-06 — Las convenciones se implementan una vez en tooling reusable y evidencia compartida

Las reglas comunes de auth, errores, correlación, retries y contratos se centralizan en tooling o librerías compartidas. Los endpoints no deben copiar convenciones manualmente de forma divergente.

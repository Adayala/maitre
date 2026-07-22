# Contrato de integración — SPEC-170 External Review Platforms

Definir un puerto reemplazable para importar reseñas y metadatos permitidos mediante cursor,
webhook o polling, aislando SDKs del dominio. Cada adaptador declara capacidades, rate limits,
freshness, términos y estrategia de backoff; credenciales viven en secret manager. Tests de
contrato cubren paginación, deduplicación, edición/borrado, 429, timeout, cursor inválido,
redacción, observabilidad y degradación sin bloquear operaciones.

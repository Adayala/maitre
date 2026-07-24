# Verificación — SPEC-215

## Criterios

### CAD-215-01 — Las APIs HTTP comparten una semántica única de rutas, requests, respuestas y versiones

- [ ] OpenAPI se regenera sin drift desde schemas ejecutables;
- [ ] cada endpoint documenta éxito, problemas, auth y contexto;
- [ ] ejemplos y fixtures contienen sólo datos sintéticos.

### CAD-215-02 — La autorización multi-tenant se valida server-side en cada operación

- [ ] token ausente/inválido devuelve 401 sin filtrar causa sensible;
- [ ] falta de permiso devuelve 403 o 404 según política de no revelación;
- [ ] tenant o sucursal manipulados no amplían acceso;
- [ ] `/v1/me/context` produce el mismo alcance autorizado aunque se envíen headers de selección;
- [ ] CORS y límites varían sólo mediante config validada.

### CAD-215-03 — Problem Details y contratos de error son consistentes, accionables y seguros

- [ ] logs, problemas y OpenAPI no incluyen secretos;
- [ ] los problemas diferencian categorías sin exponer detalles sensibles;
- [ ] la forma de error permanece consistente entre dominios.

### CAD-215-04 — Idempotencia y concurrencia se gobiernan explícitamente en comandos críticos

- [ ] replay con misma key/payload devuelve el resultado original;
- [ ] misma key con payload distinto devuelve 409;
- [ ] requests concurrentes no duplican el efecto;
- [ ] fallo después de efecto externo puede recuperarse sin repetirlo;
- [ ] `If-Match` obsoleto no sobrescribe cambios críticos.

### CAD-215-05 — Paginación, evolución y compatibilidad se gobiernan desde contratos versionados

- [ ] un cambio breaking no aprobado falla CI;
- [ ] cliente tolera campos adicionales en respuestas;
- [ ] cursor conserva orden estable y no mezcla filtros.

### CAD-215-06 — Las convenciones se implementan una vez en tooling reusable y evidencia compartida

- [ ] timeouts abortan trabajo del cliente y liberan recursos del servidor cuando sea posible;
- [ ] retry respeta `Retry-After`, backoff, jitter y máximo;
- [ ] correlation/trace conecta request, logs y error entregado al cliente.

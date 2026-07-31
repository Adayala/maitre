# Verificación — SPEC-215

## Criterios

### CAD-215-01 — Las APIs HTTP comparten una semántica única de rutas, requests, respuestas y versiones

- [x] OpenAPI se regenera sin drift desde schemas ejecutables;
- [x] cada endpoint documenta éxito, problemas, auth y contexto;
- [ ] ejemplos y fixtures contienen sólo datos sintéticos.

### CAD-215-02 — La autorización multi-tenant se valida server-side en cada operación

- [x] token ausente/inválido devuelve 401 sin filtrar causa sensible;
- [x] falta de permiso devuelve 403 o 404 según política de no revelación;
- [x] tenant o sucursal manipulados no amplían acceso;
- [x] `/v1/me/context` produce el mismo alcance autorizado aunque se envíen headers de selección;
- [ ] CORS y límites varían sólo mediante config validada.

### CAD-215-03 — Problem Details y contratos de error son consistentes, accionables y seguros

- [x] logs, problemas y OpenAPI no incluyen secretos;
- [x] los problemas diferencian categorías sin exponer detalles sensibles;
- [x] la forma de error permanece consistente entre dominios.

### CAD-215-04 — Idempotencia y concurrencia se gobiernan explícitamente en comandos críticos

- [ ] replay con misma key/payload devuelve el resultado original;
- [ ] misma key con payload distinto devuelve 409;
- [ ] requests concurrentes no duplican el efecto;
- [ ] fallo después de efecto externo puede recuperarse sin repetirlo;
- [ ] `If-Match` obsoleto no sobrescribe cambios críticos.

### CAD-215-05 — Paginación, evolución y compatibilidad se gobiernan desde contratos versionados

- [x] un cambio breaking no aprobado falla CI;
- [ ] cliente tolera campos adicionales en respuestas;
- [ ] cursor conserva orden estable y no mezcla filtros.

### CAD-215-06 — Las convenciones se implementan una vez en tooling reusable y evidencia compartida

- [ ] timeouts abortan trabajo del cliente y liberan recursos del servidor cuando sea posible;
- [ ] retry respeta `Retry-After`, backoff, jitter y máximo;
- [x] correlation/trace conecta request, logs y error entregado al cliente.

Evidencia del corte implementado:
[Cierre de gaps del MVP](../../operations/mvp-gap-closure-2026-07-30.md). Los criterios todavía
abiertos pertenecen al contrato amplio de idempotencia, concurrencia, paginación y resiliencia del
cliente; no se infieren como completos a partir del journey del MVP. CORS sí está gobernado por
allowlist validada, mientras los límites y timeouts continúan como constantes de aplicación.

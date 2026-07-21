# Decisiones — SPEC-224

## Decisiones

- PostgreSQL real es obligatorio porque SQLite/mocks no representan RLS, locks, tipos ni semántica elegida.
- MSW simula el boundary HTTP del frontend; no certifica backend.
- Fastify inject acelera rutas sin perder hooks/validación del framework.
- Builders con defaults mínimos evolucionan mejor que snapshots JSON globales.
- Property/mutation testing es selectivo para maximizar defectos encontrados por minuto de CI.
- Chromium cubre PRs; diversidad de browser se ejecuta antes de release o programada.

## Antipatrones a evitar

- un test por método privado;
- snapshots enormes aprobados sin leer;
- mock de ORM que devuelve exactamente lo esperado;
- shared “admin user” que invalida aislamiento;
- `waitForTimeout` para sincronización;
- retries que vuelven verde una suite inestable;
- tests E2E para todas las validaciones de formulario;
- copiar datos productivos “anonimizados” sin proceso verificable.

## Métricas útiles

- defectos escapados por capa/dominio;
- duración p50/p95 por suite;
- flake rate y tiempo de resolución;
- tests más lentos/inestables;
- coverage de código nuevo y branch coverage crítica;
- mutation score selectivo;
- costo/minutos CI por PR y release.

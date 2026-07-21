# ADR-003 — React and Node Toolchain

| Campo | Valor |
| --- | --- |
| **Estado** | PROPOSED |
| **Fecha** | 2026-07-21 |
| **Decidido por** | Pendiente |
| **Specs relacionadas** | SPEC-207, SPEC-209, SPEC-211, SPEC-213, SPEC-224, SPEC-226 |

## Contexto

React.js y Node.js necesitan un toolchain estricto, open source, portable y coherente con arquitectura por capas y contratos generados.

## Opciones consideradas

- Vite + React Router + TanStack Query; Fastify + Zod + Drizzle.
- Next.js full-stack.
- Express y contratos/migraciones manuales.

## Decisión propuesta

Adoptar Vite/React Router/TanStack Query para web; Fastify para API; Zod como schema ejecutable; OpenAPI generado; Drizzle/postgres.js para PostgreSQL; Vitest, Testing Library, MSW y Playwright para pruebas.

## Consecuencias

### Positivas

- build SPA portable;
- contratos y validación compartidos sin tipos duplicados;
- servidor Fastify reutilizable en Vercel/Node;
- SQL/migraciones visibles;
- tests rápidos y alineados con Vite.

### Negativas

- composición explícita de varias herramientas;
- routing/SSR avanzado no incluido;
- disciplina para impedir que Drizzle o Fastify entren al dominio;
- upgrades coordinados de toolchain.

## Criterios de aceptación

- walking skeleton construye fuera de Vercel;
- Fastify corre en adapter Vercel y proceso Node;
- OpenAPI no tiene drift;
- Drizzle conecta por pooler y migra desde cero;
- gates SPEC-207/224 pasan dentro de cuota.

La evidencia y el resultado de cada criterio se registran en [SPEC-226](../sdd/spec-226-transversal-i0-platform-validation-spikes/README.md). Hasta completarlos, la decisión permanece `PROPOSED`.

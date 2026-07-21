# [SPEC-211] Implementation Toolchain

Selección del toolchain open source para implementar el MVP con React.js, Node.js, Supabase y Vercel.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-211 |
| **Tipo** | Transversal / Architecture Decision |
| **Dominio** | Platform / Engineering |
| **Estado** | DRAFT — PROPOSED FOR APPROVAL |
| **Prioridad** | P0 |
| **Fase** | Antes del scaffolding |
| **Depende de** | SPEC-207, SPEC-208, SPEC-209, SPEC-210 |

## Decisiones propuestas

| Área | Herramienta |
| --- | --- |
| Web | React.js + Vite + TypeScript |
| Routing | React Router |
| Server state | TanStack Query |
| API | Fastify sobre Node.js |
| Schemas | Zod |
| API contract | OpenAPI generado desde schemas |
| PostgreSQL | Drizzle ORM + postgres.js |
| Migrations | Drizzle Kit, SQL versionado y revisado |
| Unit/integration | Vitest |
| React tests | Testing Library |
| E2E | Playwright |
| Lint/format | ESLint flat config + Prettier |
| Boundaries | dependency-cruiser + reglas ESLint |
| Quality | SonarQube/SonarCloud |

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Decisiones y fuentes](notes.md)

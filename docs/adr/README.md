# Architecture Decision Records

Los ADRs conservan el contexto, las alternativas y las consecuencias de decisiones técnicas significativas. Las reglas de lifecycle y reemplazo están en [SPEC-225](../sdd/spec-225-transversal-spec-adr-governance/).

## Estados

- `PROPOSED`: en revisión; no obliga implementación.
- `ACCEPTED`: decisión vigente.
- `DEPRECATED`: aún visible pero no recomendada para trabajo nuevo.
- `SUPERSEDED`: reemplazada por otro ADR enlazado.

## Registro

| ADR                                                | Estado   | Decisión                                                                 |
| -------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| [ADR-001](ADR-001-initial-runtime-and-platform.md) | ACCEPTED | React.js, Node.js y Vercel como plataforma inicial portable              |
| [ADR-002](ADR-002-supabase-data-and-identity.md)   | PROPOSED | Supabase para PostgreSQL, Auth y Storage inicial                         |
| [ADR-003](ADR-003-react-node-toolchain.md)         | PROPOSED | Vite, Fastify, Zod, Drizzle y toolchain de pruebas                       |
| [ADR-004](ADR-004-ui-foundations.md)               | PROPOSED | CSS/tokens nativos como baseline y evaluación de dependencias UI         |
| [ADR-005](ADR-005-mvp-demo-telemetry-backend.md)   | ACCEPTED | Demo conserva telemetría portable y evidencia CI sin backend OTLP remoto |

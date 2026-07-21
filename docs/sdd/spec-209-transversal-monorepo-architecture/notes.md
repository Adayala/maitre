# NOTES — SPEC-209

## Decisiones adoptadas

- Monorepo con npm workspaces porque SPEC-048 ya establece npm.
- TypeScript en frontend, backend y contratos.
- Monolito modular antes que microservicios.
- Módulos de negocio contienen sus propias capas domain/application; los paquetes transversales expresan una capacidad concreta.
- Versionado conjunto durante el MVP.

## Decisiones propuestas pendientes de evidencia

- Vite SPA, Fastify, Zod, Vitest/Playwright y dependency-cruiser: ADR-003 + SPK-01/05.
- Drizzle/postgres.js: ADR-003 + SPK-02/04.
- Supabase PostgreSQL/Auth: ADR-002 + SPK-02/03/04/06.
- Estrategia de build incremental/cache: SPK-05 con medición antes de agregar tooling.

Cada decisión pendiente requiere comparación breve contra costo cero, portabilidad, mantenibilidad y compatibilidad con las specs.

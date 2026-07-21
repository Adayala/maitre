# PLAN — SPEC-211

## Fase 1 — Tooling root

1. Inicializar npm workspaces y lockfile.
2. Fijar Node.js LTS.
3. Configurar TypeScript, ESLint, Prettier y dependency-cruiser.
4. Configurar Vitest y cobertura.
5. Configurar Sonar y CI según SPEC-207.

## Fase 2 — Web shell

1. Crear React.js + Vite + TypeScript.
2. Añadir router y QueryClient.
3. Crear error boundary, loading y configuración validada.
4. Añadir tests de render y accesibilidad básicos.
5. Verificar build estático y preview Vercel.

## Fase 3 — API shell

1. Crear Fastify app factory.
2. Crear entradas Node y Vercel.
3. Registrar Zod/OpenAPI y error handler.
4. Implementar health contract y tests con `inject()`.
5. Verificar ejecución en Vercel y Node estándar.

## Fase 4 — Persistencia

1. Configurar Drizzle y postgres.js dentro de adapter.
2. Crear primera migración revisable.
3. Añadir RLS/grants custom.
4. Probar migración, rollback compensatorio y restore.
5. Conectar health de database sin exponer detalles.

# Contrato transversal — SPEC-211 Implementation Toolchain

React, Node.js y TypeScript estricto comparten schemas ejecutables; OpenAPI se genera sin
duplicar contratos. Herramientas seleccionadas son open source, fijadas por lockfile y
reemplazables: Vite, Fastify, Zod, Drizzle, Vitest, Testing Library y Playwright permanecen
sujetas a ADR/spikes. Instalación, lint, typecheck, tests y build deben funcionar local y CI.

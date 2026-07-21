# NOTES — SPEC-209

## Decisiones adoptadas

- Monorepo con npm workspaces porque SPEC-048 ya establece npm.
- TypeScript en frontend, backend y contratos.
- Monolito modular antes que microservicios.
- Paquetes organizados por responsabilidad arquitectónica y módulos de dominio, no por proveedor.
- Versionado conjunto durante el MVP.

## Decisiones pendientes

- Framework React.js y estrategia SPA/SSR.
- Framework HTTP Node.js.
- Herramienta de schemas/validación.
- Runner de tests y E2E.
- Herramienta concreta para boundaries/ciclos.
- Estrategia de build incremental y cache.
- Base de datos, ORM y proveedor de identidad.

Cada decisión pendiente requiere comparación breve contra costo cero, portabilidad, mantenibilidad y compatibilidad con las specs.

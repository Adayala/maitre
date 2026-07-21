# Matriz de dependencias — SPEC-209

## Leyenda

- `ALLOW`: dependencia directa permitida por API pública.
- `DENY`: bloqueada por dependency-cruiser/ESLint.
- `COMPOSE`: sólo permitida en composition root.

| Origen | Destino | Regla |
| --- | --- | --- |
| module domain | mismo module domain | ALLOW |
| module domain | application/contracts/adapters/apps | DENY |
| module application | mismo module domain/application | ALLOW |
| module application | otro módulo | DENY salvo port/evento público aprobado |
| module application | contracts/adapters/apps/framework | DENY |
| contracts | Zod y contracts internos | ALLOW |
| contracts | modules/adapters/apps/server config | DENY |
| adapter | ports/API pública de módulos + SDK propio | ALLOW |
| adapter | internals de otro adapter | DENY |
| apps/api composition | módulos + adapters + config/server | COMPOSE |
| apps/api routes | contracts + API pública de casos de uso | ALLOW |
| apps/web | contracts + config/browser + ui/tokens | ALLOW |
| apps/web | modules/adapters/config/server/Node APIs | DENY |
| ui | React + design-tokens | ALLOW |
| ui | modules/adapters/config/server | DENY |
| test-utils | APIs públicas y librerías de test | ALLOW sólo desde tests |
| código productivo | test-utils | DENY |

## API pública

Cada workspace usa `package.json#exports`. Sólo `index.ts` o subpaths documentados forman parte de su API. Imports relativos que atraviesan otro workspace y deep imports a `src/*` están prohibidos.

## Ciclos y huérfanos

- Todo ciclo entre workspaces o capas bloquea CI.
- Ciclos de tipos también se corrigen; `import type` no justifica arquitectura circular.
- Módulos huérfanos productivos se bloquean o documentan si son entrypoints descubiertos por framework.

## Canarios

`npm run deps:check` debe demostrar al menos:

1. domain importando Drizzle falla;
2. web importando config/server falla;
3. módulo importando internals de otro falla;
4. contracts importando una entity falla;
5. ciclo entre dos workspaces falla;
6. app composition importando adapters aprobados pasa.

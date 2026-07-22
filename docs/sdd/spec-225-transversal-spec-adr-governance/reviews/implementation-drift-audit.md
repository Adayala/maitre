# Auditoría retroactiva de implementación adelantada

Línea base de Gate R0 para PLAT-REV-003. Inspecciona el historial sin reescribirlo y no concede
aprobación retroactiva. La evidencia de tests actual no demuestra por sí sola qué gate pasó en
el commit original.

## Alcance

| Commit | Declaración | Specs declaradas | Observación inicial |
| --- | --- | --- | --- |
| `8544e5a` | walking skeleton Tenant/Branch/User/Membership/Auth | 001, 004, 017, 020, 023 | scaffolding + dominio + API/contexto, sin tests versionados en el commit |
| `7e036b2` | Brand entity | 002 | entidad, schema, repo y create use case, sin tests versionados en el commit |
| `e1dfda1` | FiscalEntity entity | 003 | entidad, schema, repo y use case, sin tests versionados en el commit |
| `2ac8a5f` | Salon/Table + test suite | 005, 006 | agrega tests retroactivos de Organization/Identity y mezcla una revisión SDD |
| `ff600d2` | Role/Permission/authorization | 018, 019, 026 | dominio, schemas y tests; modifica Membership |
| `25b4175` | Organization REST APIs | 007–012 | rutas/tests Organization; incluye cambios Identity/Membership fuera del título |

Todas las specs transversales SPEC-207–226 seguían `DRAFT/BLOCKED` y SPEC-225 no registra una
aprobación previa para estos incrementos. ADR-002/003/004 permanecen `PROPOSED`. Por lo tanto,
estos commits son evidencia de implementación existente, no evidencia de autorización SDD.

## Findings

### DRIFT-001 — Primer incremento sin tests commit-local

`8544e5a`, `7e036b2` y `e1dfda1` no agregan archivos de test. Tests posteriores pueden cubrir
parte del comportamiento, pero no reconstruyen automáticamente los comandos ejecutados, gates,
resultados ni criterios vigentes al momento del commit.

Resolución requerida:

- mapear cada contrato/invariante a tests actuales;
- identificar criterios todavía no cubiertos;
- ejecutar baseline reproducible sobre HEAD;
- conservar “evidencia posterior” separada de “evidencia commit-local”.

### DRIFT-002 — Commits con alcance mayor al título

- `2ac8a5f` incorpora tests de User/Membership/Branch/Brand/FiscalEntity y el informe de revisión
  Organization además de Salon/Table.
- `25b4175` modifica Membership, Role y create-membership además de APIs Organization.

La mezcla dificulta rollback, ownership y trazabilidad Conventional Commits. No invalida el
código, pero exige registrar todas las specs afectadas y revisar compatibilidad cruzada.

### DRIFT-003 — Lifecycle modificado dentro del mismo `feat`

Los commits actualizan README/SPECS junto con la implementación. La metadata resultante no
incluye evidencia de reviewer/approval anterior y utiliza valores observados como
`IN_PROGRESS/WALKING_SKELETON_I0`, ya señalados como no canónicos.

La corrección debe preservar historial: decidir el enum, registrar excepción/revisión
retroactiva y actualizar metadata mediante un commit documental separado.

### DRIFT-004 — Toolchain/platform cristalizados antes de ADRs

`8544e5a` introduce workspace TypeScript, API serverless, contratos y memory adapter; commits
posteriores expanden esa estructura mientras ADR-003 sigue propuesta y SPEC-226 no aporta aún
evidencia PASS. El diseño puede ser razonable, pero debe validarse contra portabilidad, free tier,
quality gates y exit strategy antes de considerarse foundation aprobado.

### DRIFT-005 — Evidencia de contratos incompleta

Los commits referencian IDs en títulos, pero no guardan una manifestación machine-readable de:

- commit exacto de spec revisada;
- reviewer/outcome;
- criterios de aceptación seleccionados;
- comandos/resultados de lint, types, tests, build y seguridad;
- ADR/spike vigente y excepciones.

Gate R0 debe definir este manifest/evidence contract antes de nuevos commits `feat`.

## Matriz de revisión retroactiva

| Grupo | Specs | Informe aplicable | Estado de auditoría |
| --- | --- | --- | --- |
| Organization entities | 001–006 | `organization-spec-001-016.md` | requiere mapear findings/tests |
| Organization APIs | 007–012 | `organization-spec-001-016.md` | requiere OpenAPI/contract/gate evidence |
| Identity/auth | 017–020, 023, 026 | `identity-spec-017-026.md` | bloqueado por ciclo, session ADR y roles |
| Platform/toolchain | 207–226 | `platform-transversal-spec-207-226.md` | bloqueado por DAG, ADRs y spikes |

## Evidencia de salida para PLAT-REV-003

PLAT-REV-003 puede pasar a `IN_REVIEW` cuando exista, por cada commit:

1. lista completa de specs/ADRs afectadas;
2. mapping criterio→test/evidencia o gap explícito;
3. baseline de gates ejecutado sobre un commit identificable;
4. findings críticos/altos resueltos o excepción autorizada;
5. owner y reviewer que registren outcome sin autoaprobar su propio trabajo.

Sólo después puede resolverse. Esto no marca las specs `VERIFIED`: cada una conserva su propio
lifecycle y criterios de despliegue.

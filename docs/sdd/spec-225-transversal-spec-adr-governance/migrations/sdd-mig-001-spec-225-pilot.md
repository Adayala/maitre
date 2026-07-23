# SDD-MIG-001 — Piloto de trazabilidad de SPEC-225

## Estado

```yaml
batchId: SDD-MIG-001
status: PLANNED
scope:
  specs: [SPEC-225]
  artifacts:
    - README.md
    - objective.md
    - specification.md
    - rules.md
    - structure.md
    - verification.md
    - plan.md
    - tasks.md
    - contract.md
baselineCommit: NOT_FROZEN
worktreeSnapshot: NOT_FROZEN
owner: UNASSIGNED
reviewers: [UNASSIGNED]
outcome: PENDING
reviewedCommit: null
```

El lote no puede pasar a `BASELINED` hasta congelar el worktree relevante y resolver
owner/reviewer.

## Objetivo

Validar, sobre una única spec de gobernanza, que los contratos de identidad y trazabilidad pueden
aplicarse sin cambiar semántica normativa, marcar criterios/tareas, promover lifecycle/readiness,
mezclar implementación productiva ni perder historia.

El piloto prueba el procedimiento documental, no el validador ni la implementación futura.

## Out of scope

- modificar código, CI o tooling;
- implementar `sdd:validate`;
- migrar SPEC-001–224 o SPEC-226;
- editar los 136 README locales no versionados;
- asignar personas, prioridad o approvals;
- resolver ADRs, spikes, gates o evidencia externa;
- refinar los 20 `DOCUMENT_SKELETON`;
- generar catálogo/INDEX definitivo.

## Transformaciones propuestas

| Artefacto | Transformación |
| --- | --- |
| `objective.md` | asignar `SPEC-225-OBJ-*`, alcance y señales existentes |
| `specification.md` | clasificar/asignar `SPEC-225-REQ-*` sin elevar fuerza |
| `rules.md` | asignar `SPEC-225-RULE-*` a invariantes reales |
| `structure.md` | declarar skeleton o boundaries reales revisados |
| `verification.md` | asignar `SPEC-225-AC-*`, conservar checks abiertos |
| `plan.md` | convertir outcomes en `SPEC-225-MS-*`; distinguir etapas |
| `tasks.md` | asignar `SPEC-225-TSK-*`, preservar estados/checks |
| `contract.md` | proponer revisión inicial y compatibilidad |
| `README.md` | enlazar nodos/mapping sin cambiar lifecycle |

La tabla describe intención; no aprueba ninguna transformación.

## Mappings requeridos

El lote debe producir:

- `objective-map.yaml`;
- `requirement-map.yaml`;
- `rule-map.yaml`;
- `boundary-map.yaml`;
- `criteria-map.yaml`;
- `milestone-map.yaml`;
- `task-map.yaml`;
- `traceability-edges.yaml`;
- `legacy-checks-audit.yaml`.

Los nombres son artefactos lógicos. Su formato final se congela al pasar a `BASELINED`.
Todos usan `migration-mapping-schema-contract.md` schemaVersion 1.

## Métricas before/after

| Métrica | Before esperado | Exit |
| --- | ---: | ---: |
| nodos OBJ con ID | 0 | todos los outcomes clasificados |
| nodos REQ con ID | 0 | todas las obligaciones clasificadas |
| nodos RULE con ID | 0 | todas las invariantes clasificadas |
| nodos BND con ID | 0 | skeleton declarado o boundaries revisados |
| nodos AC con ID | 0 | todos los criterios clasificados |
| nodos MS con ID | 0 | todos los hitos clasificados |
| nodos TSK con ID | 0 | todas las tareas clasificadas |
| edges canónicos | 0 | cardinalidades calculadas, gaps explícitos |
| checks promovidos | 0 | 0 |
| lifecycle/readiness promovidos | 0 | 0 |

Los totales exactos de nodos se establecen durante mapping/review, no antes de analizar atomicidad.

## Condiciones de entrada

- owner de gobernanza `ACCEPTED`;
- reviewers Product + Architecture aceptados y segregados del autor cuando corresponda;
- baseline commit y snapshot de paths congelados;
- snapshot conforme a `worktree-baseline-snapshot-contract.md`;
- cambios locales concurrentes identificados;
- schemaVersion 1 de mappings aprobado;
- contrato de lotes aprobado.

## Procedimiento

1. Congelar baseline sin modificar archivos.
2. Copiar cada statement a su mapping y clasificarlo.
3. Revisar splits, exclusiones y fuerza normativa.
4. Asignar IDs sólo después de aprobar mapping.
5. Aplicar IDs/refs a los nueve artefactos.
6. Construir edges y reportar huérfanos.
7. Verificar links, identidad, metadata y diff.
8. Registrar before/after y findings.
9. Obtener review sobre commit exacto.

## Riesgos

- convertir explicación en obligación;
- cambiar semántica al dividir statements;
- interpretar checks históricos como evidencia;
- autoaprobar la gobernanza que define su propio review;
- publicar IDs antes de estabilizar mapping;
- mezclar cambios documentales actuales con el baseline del piloto.

Cada riesgo abierto mantiene el lote fuera de `ACCEPTED`.

## Criterios de salida

- [ ] Manifest `BASELINED` con commit/snapshot.
- [ ] Nueve mappings completos y revisados.
- [ ] IDs únicos, estables y enlazados.
- [ ] Huérfanos/gaps reportados.
- [ ] Cero promoción de checks/lifecycle.
- [ ] Cero cambios fuera de scope.
- [ ] Reviewer registra outcome sobre commit exacto.

Todos los checks permanecen abiertos.

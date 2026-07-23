# Manifests de remediación de navegación — SPEC-225

## Estado común

```yaml
status: PLANNED
owner: UNASSIGNED
reviewers: [UNASSIGNED]
baselineSnapshot: NOT_FROZEN
outcome: PENDING
```

Estos manifests especifican cambios documentales; no los ejecutan.

## NAV-01 — Artefactos base versionados

```yaml
batchId: NAV-01
scope:
  readmes: 84
  orphanArtifacts: 279
  byFilename:
    structure.md: 83
    plan.md: 64
    tasks.md: 63
    objective.md: 60
    rules.md: 5
    verification.md: 4
outOfScope:
  - contratos especializados
  - README no versionados
  - cambios semánticos/lifecycle
```

### Transformación

Cada README recibe o completa una sección `## Documentos` con los artefactos base existentes:

```markdown
## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Contrato](contract.md)
- [Reglas](rules.md)
- [Estructura](structure.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
```

Reglas:

- no enlazar archivos ausentes;
- no duplicar links equivalentes con/sin `./`;
- conservar labels específicos cuando aclaran el rol;
- no mover contenido ni reescribir metadata;
- no enlazar `notes.md` eliminado/ausente para fabricar navegación;
- no interpretar link como completitud/aprobación.

### Sub-lotes

| Sub-lote | Specs | Objetivo |
| --- | --- | --- |
| `NAV-01-A` | 001–016 | Organization |
| `NAV-01-B` | 017–036 | Identity/Subscription |
| `NAV-01-C` | 037–054 | Catalog/Audit/Floor core |
| `NAV-01-D` | 066–070 | Reservations core |
| `NAV-01-E` | 081–086 | Ordering core |
| `NAV-01-F` | 098–101 | Kitchen core |
| `NAV-01-G` | 207–226 | Transversales |

Sólo se incluyen specs con orphans en el snapshot. Los rangos son particiones de review, no
instrucciones para editar paths inexistentes.

### Ratchet

```yaml
before:
  trueOrphans: 279
after:
  trueOrphans: 0
  brokenLinksAdded: 0
  metadataChanges: 0
  semanticChanges: 0
```

## NAV-02 — Contratos especializados

```yaml
batchId: NAV-02
scope:
  orphanContracts: 10
outOfScope:
  - artefactos base
  - contenido de contratos
  - lifecycle/readiness
```

| Owner spec | Contrato | Label |
| --- | --- | --- |
| SPEC-016 | `organization-readiness-contract.md` | Readiness Organization |
| SPEC-023 | `browser-session-contract.md` | Sesión de navegador |
| SPEC-026 | `identity-dependency-contract.md` | Dependencias Identity |
| SPEC-036 | `subscription-authority-contract.md` | Autoridad Subscription |
| SPEC-043 | `catalog-authority-contract.md` | Autoridad Catalog |
| SPEC-048 | `audit-dashboard-authority-contract.md` | Autoridad Audit/Dashboard |
| SPEC-207 | `quality-baseline-contract.md` | Baseline de calidad |
| SPEC-208 | `budget-register-contract.md` | Registro de presupuesto |
| SPEC-218 | `command-matrix.md` | Matriz de comandos offline |
| SPEC-220 | `restore-exit-contract.md` | Restore y estrategia de salida |

Cada link se agrega bajo `## Contratos especializados` o sección equivalente. El contrato conserva
su owner spec y rol `AUTHORITATIVE`; el link no implica review.

Ratchet:

```yaml
before:
  trueOrphans: 10
after:
  trueOrphans: 0
  brokenLinksAdded: 0
  contentChanges: 0
```

## Orden y atomicidad

1. Congelar snapshot de paths README/targets.
2. Ejecutar NAV-02 primero por scope pequeño y autoritativo.
3. Ejecutar NAV-01 por sub-lote.
4. Recalcular reachability después de cada sub-lote.
5. Rechazar cualquier aumento de links rotos.
6. Emitir DOC-REV por sub-lote y outcome global.

NAV-02 primero no representa prioridad de producto.

## Concurrencia

Si un README cambia después del snapshot:

- queda fuera del sub-lote activo;
- se marca snapshot stale para ese path;
- se crea successor/rebase documental revisado;
- no se sobreescribe el cambio concurrente.

## Review

Dimensiones mínimas:

- `REV-SCOPE`;
- `REV-DESIGN` para autoridad/rol;
- `REV-TRACEABILITY`;
- `REV-QUALITY`.

Reviewer comprueba 289 destinos existentes, cero duplicados y cero cambios fuera de navegación.

## Estado NAV-03

Los 1.088 candidatos de README no versionados no entran a NAV-01/02. Se mantienen
`OWNERSHIP_BLOCKED` y siguen `placeholder-readme-migration.md`.

## Criterios de salida

- [ ] Snapshot congelado.
- [ ] NAV-02 reduce 10→0.
- [ ] NAV-01 reduce 279→0.
- [ ] Cero links rotos/duplicados nuevos.
- [ ] Cero cambios de metadata/lifecycle/contenido contractual.
- [ ] DOC-REV sobre commits exactos.

Los checks permanecen abiertos.

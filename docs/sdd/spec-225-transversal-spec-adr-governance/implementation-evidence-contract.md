# Contrato de evidencia de implementación — SPEC-225

## Propósito

Vincular un cambio de comportamiento con specs/ADRs concretas, criterios verificables, gates y
aprobación humana. La evidencia complementa la metadata autoritativa; no cambia lifecycle por sí
sola ni permite que el autor se autoapruebe.

## Unidad

Una `ImplementationEvidence` identifica un commit inmutable o un candidate commit de PR. Si el
commit cambia, la evidencia se vuelve stale y los gates deben asociarse al nuevo SHA. Squash o
rebase exige regeneración; copiar resultados de otro SHA no es válido.

## Schema lógico v1

```yaml
schemaVersion: 1
change:
  commit: <sha completo>
  title: <Conventional Commit propuesto>
  producedAt: <timestamp UTC del pipeline>
specs:
  - id: SPEC-NNN
    specCommit: <sha completo que contiene el contrato revisado>
    criteria:
      - id: <identificador estable del criterio>
        evidenceRefs: [<gate/artifact/test ref>]
adrs:
  - id: ADR-NNN
    decisionCommit: <sha completo>
    status: ACCEPTED
gates:
  - id: <gate estable>
    command: <comando allowlisted/documentado>
    outcome: PASS | FAIL | NOT_RUN
    exitCode: <entero o null>
    artifactRef: <referencia opcional>
    artifactSha256: <hash opcional>
exceptions:
  - findingId: <ID estable>
    decisionRef: <ADR/review/approval>
    owner: <rol/persona autorizada>
    expiresAt: <timestamp UTC>
review:
  outcome: APPROVE | REQUEST_CHANGES | BLOCKED
  reviewer: <identidad verificable>
  reviewedCommit: <sha completo>
  recordedAt: <timestamp UTC>
```

La serialización concreta puede ser JSON/YAML o artifact firmado del CI, pero debe validar el
mismo schema y producir una vista humana. No se aceptan campos libres para sustituir IDs,
outcomes o hashes normativos.

## Reglas

1. `change.commit`, `specCommit`, `decisionCommit` y `reviewedCommit` usan SHA completo.
2. Cada spec tiene `Estado: READY_FOR_IMPLEMENTATION` en el `specCommit` declarado antes de que
   la evidencia pueda terminar en `APPROVE`.
3. Cada criterio posee ID estable dentro de su spec/verification; texto sin ID no es trazabilidad.
4. `PASS` requiere exit code exitoso y artifact/log íntegro cuando el gate produce evidencia.
5. `NOT_RUN` necesita finding/excepción; nunca se interpreta como PASS.
6. Artifacts expirables pueden vivir fuera de Git, pero se conserva hash, retention y forma de
   regenerarlos. Evidencia crítica de release debe sobrevivir el período definido por SPEC-220.
7. Ningún artifact contiene tokens, secrets, dumps productivos, PII ni payloads fiscales crudos.
8. El reviewer no es el autor único del cambio ni quien aprobó su propia excepción sensible.
9. Review sobre SHA distinto es stale. Cambios incompatibles reabren specs/consumidores.
10. Un pipeline o bot puede verificar y proponer; no puede otorgar aprobación humana.

## Gates mínimos

| Gate ID | Aplica | Evidencia |
| --- | --- | --- |
| `format` | todo cambio ejecutable | formatter check |
| `lint` | código/config | lint sin errores nuevos |
| `types` | TypeScript/contracts | typecheck estricto |
| `unit` | reglas/cálculos | tests y casos negativos |
| `contract` | APIs/events/adapters | schemas/compatibilidad |
| `integration` | DB/provider boundaries | entorno/fixtures aislados |
| `e2e` | journeys críticos | recorrido y artifacts redactados |
| `accessibility` | UI | axe/teclado/visual según riesgo |
| `security` | todo boundary | SAST/dependencies/secret scan/threat cases |
| `quality` | código productivo | análisis de deuda nueva/Sonar-equivalent |
| `build` | apps/packages | artefacto reproducible |
| `migration` | schema/datos | apply/compatibility/rollback strategy |
| `restore` | lifecycle/infra | restore/exit evidence cuando aplique |

No todos los gates corren para cada cambio. La selección deriva del tipo/riesgo de las specs y
queda explícita; omitir uno aplicable es finding, no optimización silenciosa.

## Criterios estables

Cada `verification.md` debe asignar IDs únicos, por ejemplo `SPEC-010-AC-01`. Renombrar texto
conserva ID si la semántica no cambia; un cambio incompatible crea nuevo ID y marca el anterior
como superseded. Un test puede demostrar varios criterios y un criterio puede necesitar varias
evidencias, pero la relación siempre es explícita.

## Uso retroactivo

Para commits existentes:

- `specCommit` señala el contrato realmente disponible entonces, no el actual por conveniencia;
- gates sin artifact se registran `NOT_RUN`, aunque HEAD actual pase;
- evidencia posterior se etiqueta como tal y no fabrica aprobación histórica;
- gaps producen findings vinculados a `implementation-drift-audit.md`;
- el reviewer puede aprobar la conformidad actual en un commit nuevo sin reescribir el anterior.

## Aceptación

- Schema rechaza SHA corto, IDs inexistentes, enum desconocido y review sobre otro commit.
- Fixture positivo incluye dos specs, ADR, criteria→tests, gates y reviewer.
- Fixtures negativos cubren self-approval, artifact sin hash, NOT_RUN sin excepción, spec no
  autorizada, secret-like field y excepción vencida.
- La vista humana permite ir de commit a spec/criterio/evidencia y volver.
- El contrato funciona local/CI y no depende de GitHub, Vercel, Supabase o SonarCloud.

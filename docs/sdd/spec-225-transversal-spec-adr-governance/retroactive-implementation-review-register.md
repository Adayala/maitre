# Registro de revisión retroactiva de implementación — SPEC-225

## Propósito

Este registro vincula las 36 specs actualmente `IN_PROGRESS` con commits candidatos observados en
Git. No afirma que el commit implemente todo el contrato, que los gates hayan pasado ni que existiera
aprobación previa.

Estados del registro:

- `CANDIDATE_OBSERVED`: el mensaje/diff sugiere relación; falta reconciliación.
- `MAPPED`: scope y criterios fueron comparados, con gaps explícitos.
- `EVIDENCE_COLLECTED`: gates actuales o artifacts históricos fueron registrados.
- `IN_REVIEW`: reviewer evalúa el mismo commit/evidencia.
- `COMPATIBLE`: implementación actual satisface el contrato revisado.
- `REMEDIATION_REQUIRED`: existen gaps que bloquean conformidad.
- `PREMISE_REJECTED`: la implementación parte de una decisión no aceptada.

Sólo los tres últimos son outcomes y requieren reviewer. Ninguna fila está en outcome.

## Commits candidatos

| Specs | Commit candidato | Declaración observada | Estado | Gap mínimo |
| --- | --- | --- | --- | --- |
| 001, 004, 017, 020, 023 | `8544e5a` | walking skeleton Organization/Identity/Auth | `CANDIDATE_OBSERVED` | scope real, criterios y gates commit-local |
| 002 | `7e036b2` | Brand entity | `CANDIDATE_OBSERVED` | criterios, tests y aprobación |
| 003 | `e1dfda1` | FiscalEntity entity | `CANDIDATE_OBSERVED` | criterios, tests y aprobación |
| 005–006 | `2ac8a5f` | Salon/Table y tests | `CANDIDATE_OBSERVED` | separar evidencia posterior y alcance mezclado |
| 007–012 | `25b4175` | APIs Organization | `CANDIDATE_OBSERVED` | OpenAPI, contratos, seguridad y alcance extra |
| 013–015 | `1e7756c` | outbox y eventos Organization | `CANDIDATE_OBSERVED` | envelopes, delivery, compatibilidad y gates |
| 016 | `0426801` | marca Organization RBAC en progreso | `CANDIDATE_OBSERVED` | commit documental no demuestra implementación |
| 018, 019, 026 | `ff600d2` | Role/Permission/authorization | `CANDIDATE_OBSERVED` | segregación, negativos y scope Membership |
| 021, 022, 024 | `a9c110b` | Users/Roles APIs y UserInvited | `CANDIDATE_OBSERVED` | contratos HTTP/evento, PII y gates |
| 023 | `7b5749a` | verificación de sesión Supabase | `CANDIDATE_OBSERVED` | ADR/provider spike, claims y portabilidad |
| 025 | `8a4a8e2` | audit event UserAuthenticated | `CANDIDATE_OBSERVED` | redacción, semántica de evento y evidencia |
| 027–036 | `45a6d16` | dominio Subscription | `CANDIDATE_OBSERVED` | scope por spec, catálogo, cuotas y tests |

Una spec puede relacionarse con más de un commit y un commit con varias specs. La reconciliación
debe registrar ambos sentidos; no elige un único SHA por conveniencia.

## Registro por spec

Para cada SPEC-001–036 `IN_PROGRESS` se debe producir:

```yaml
spec: SPEC-NNN
candidateCommits: [<sha completo>]
observedPaths: [<paths>]
contractCommit: <sha completo>
criteria:
  - id: <criterio estable>
    status: COVERED | PARTIAL | GAP | NOT_APPLICABLE
    evidenceRefs: [<refs>]
gates:
  - id: <gate>
    timing: COMMIT_LOCAL | POSTERIOR
    outcome: PASS | FAIL | NOT_RUN | UNKNOWN
findings: [<IDs>]
review:
  outcome: PENDING | COMPATIBLE | REMEDIATION_REQUIRED | PREMISE_REJECTED
  reviewer: <asignación o UNASSIGNED>
  reviewedCommit: <sha completo o null>
```

`UNKNOWN` describe historia no recuperable; una ejecución actual se registra `POSTERIOR`, nunca
como resultado commit-local.

## Reglas

1. Expandir SHAs cortos a SHA completo antes de crear evidencia.
2. Comparar contra el contrato vigente y registrar además cuál existía al implementar.
3. No inferir tests ejecutados por presencia de archivos.
4. Un commit documental puede explicar lifecycle, pero no demuestra comportamiento.
5. Commits con scope mezclado enumeran todas las specs afectadas.
6. ADRs o spikes pendientes permanecen gaps aunque el provider funcione actualmente.
7. `COMPATIBLE` no equivale a `VERIFIED`; el lifecycle se evalúa después.
8. README enlaza el manifest sólo cuando éste existe y fue revisado.

## Cobertura actual

- Specs `IN_PROGRESS`: 36.
- Specs con uno o más commits candidatos identificados: 36.
- README con SHA/manifest enlazado: 0.
- Manifests retroactivos completos: 0.
- Outcomes registrados: 0.

## Criterios de salida

- [ ] Las 36 specs poseen manifest por spec.
- [ ] Cada criterio está cubierto o declarado gap.
- [ ] Gates distinguen evidencia commit-local de posterior.
- [ ] ADRs/spikes pendientes aparecen como findings.
- [ ] Reviewer independiente registra outcome sobre SHA exacto.

Todos los criterios permanecen abiertos.

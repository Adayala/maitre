# Catálogo de fixtures ADRT schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para autoría, readiness, change class y lifecycle de ADRs. Este
catálogo no crea ADRs ni cambia estados existentes.

## Formato

```yaml
id: ADRT-FIX-NNN
kind: POSITIVE | NEGATIVE | CHANGE | LIFECYCLE | DETERMINISM
input:
  adr: <documento lógico>
  baseline: <commit/ADR previo o null>
  evidence: [<refs>]
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  codes: [ADRTxxx]
  readiness: <map ADR-RDY>
```

## Casos válidos

### ADRT-FIX-001 — Proposed completo

Metadata válida, “Decisión propuesta”, alternativas, riesgos, acceptance/evidence, rollback y
blockers; deciders `UNASSIGNED`.

Expected: `ACCEPT` como `PROPOSED`; nunca como decisión efectiva.

### ADRT-FIX-002 — Accepted completo

Deciders aceptados, 14 criterios aplicables PASS, evidence outcomes, accepted revision y DOC-REV.

Expected: `ACCEPT/ACCEPTED`.

### ADRT-FIX-003 — N/A justificado

Dimensión de privacy no aplica con razón/evidence.

Expected: `ACCEPT`.

### ADRT-FIX-004 — Decisión condicionada

Gate, outcomes requeridos, fallback y blockers explícitos.

Expected: `ACCEPT/PROPOSED` hasta completar decisión humana.

### ADRT-FIX-005 — Editorial

Sólo typo/formato, ninguna dimensión semántica cambia.

Expected: `ACCEPT/EDITORIAL`; conserva ADR/status.

### ADRT-FIX-006 — Clarification

Aclara término ya decidido sin ampliar scope/obligaciones.

Expected: `ACCEPT/CLARIFICATION` con review acotado.

### ADRT-FIX-007 — Compatible extension

Agrega consumer previsto/detalle compatible y revisa impactos.

Expected: `ACCEPT/COMPATIBLE_EXTENSION`.

### ADRT-FIX-008 — Proposed material revision

ADR aún `PROPOSED`; cambia opción/scope, reabre review y actualiza evidence.

Expected: `ACCEPT/MATERIAL_REVISION`; continúa no efectivo.

### ADRT-FIX-009 — Supersession válida

Nuevo ADR accepted, anterior superseded, relaciones recíprocas y migration/consumers revisados.

Expected: `ACCEPT/SUPERSESSION`.

### ADRT-FIX-010 — Deprecation válida

Alternativa, retiro, consumers, mitigación y trigger/fecha.

Expected: `ACCEPT/DEPRECATION`.

### ADRT-FIX-011 — Status quo comparado

Se evalúa explícitamente mantener estado actual y se rechaza con trade-offs.

Expected: `ACCEPT`.

### ADRT-FIX-012 — Rollback no aplicable

Decisión irreversible por naturaleza, con razón, mitigación y fallback operacional.

Expected: `ACCEPT`; N/A no es sección vacía.

## Metadata y template inválidos

### ADRT-FIX-013 — Metadata ausente/inválida

Expected: `REJECT [ADRT001]`.

### ADRT-FIX-014 — Template tratado como ADR

Template recibe ID/estado real y entra al registry.

Expected: `REJECT [ADRT001]`.

### ADRT-FIX-015 — Sección requerida ausente

Expected: `REJECT [ADRT002]`.

### ADRT-FIX-016 — Placeholder vacío

Sección contiene sólo TODO/TBD/texto del template sin blocker.

Expected: `REJECT [ADRT002]`.

### ADRT-FIX-017 — N/A sin razón

Expected: `REJECT [ADRT002]`.

## Contexto, scope y opciones

### ADRT-FIX-018 — Contexto circular

Justifica opción porque “es la elegida”, sin problema/drivers.

Expected: `REJECT [ADRT003]`.

### ADRT-FIX-019 — Scope implícito

No define dominios/entornos/consumers ni fuera de alcance.

Expected: `REJECT [ADRT003]`.

### ADRT-FIX-020 — Preference como constraint

Expected: `REJECT [ADRT003]`.

### ADRT-FIX-021 — Una sola opción

No justifica ausencia de alternativas.

Expected: `REJECT [ADRT004]`.

### ADRT-FIX-022 — Lista de vendors sin trade-offs

Expected: `REJECT [ADRT004]`.

### ADRT-FIX-023 — Evidencia comparativa sesgada

Métricas/configuraciones no comparables o sources omitidas.

Expected: `REJECT [ADRT004]`.

## Decisión y consecuencias

### ADRT-FIX-024 — Proposed con wording efectivo

Estado `PROPOSED`, sección afirma “se adopta” sin condicional/blocker.

Expected: `REJECT [ADRT005]`.

### ADRT-FIX-025 — Accepted aún dice propuesta

Expected: `REJECT [ADRT005]`.

### ADRT-FIX-026 — Scope de decisión excede contexto

Expected: `REJECT [ADRT005]`.

### ADRT-FIX-027 — Implementación detallada sustituye specs

Expected: `REJECT [ADRT005]`.

### ADRT-FIX-028 — Sólo consecuencias positivas

Expected: `REJECT [ADRT006]`.

### ADRT-FIX-029 — Security/tenancy omitidos

Aplican materialmente, no están evaluados ni N/A.

Expected: `REJECT [ADRT006]`.

### ADRT-FIX-030 — Cost/operations omitidos

Expected: `REJECT [ADRT006]`.

## Acceptance, evidence y rollback

### ADRT-FIX-031 — Acceptance no verificable

“Debe funcionar bien” sin criterio/outcome.

Expected: `REJECT [ADRT007]`.

### ADRT-FIX-032 — Criteria escritos usados como evidence

Expected: `REJECT [ADRT007]`.

### ADRT-FIX-033 — Spike NOT_RUN promueve ADR

Expected: `REJECT [ADRT007]`.

### ADRT-FIX-034 — Spikes completos auto-seleccionan

No existe decisión de deciders.

Expected: `REJECT [ADRT007]`.

### ADRT-FIX-035 — Rollback ausente

Aplica, pero no está especificado.

Expected: `REJECT [ADRT008]`.

### ADRT-FIX-036 — Trigger no observable

“Revisar más adelante”.

Expected: `REJECT [ADRT008]`.

### ADRT-FIX-037 — Consumers omitidos

Expected: `REJECT [ADRT008]`.

## Change class y lifecycle

### ADRT-FIX-038 — Material como editorial

Option/scope/obligation cambia y proposed class es `EDITORIAL`.

Expected: `REJECT [ADRT009]`.

### ADRT-FIX-039 — Compatible extension incompatible

Rompe consumer existente.

Expected: `REJECT [ADRT009]`.

### ADRT-FIX-040 — Accepted reescrito materialmente

Mismo ADR/ID cambia decisión.

Expected: `REJECT [ADRT009, ADRT010]`; requiere successor.

### ADRT-FIX-041 — Accept sin readiness

Al menos un criterio requerido `FAIL/INCONCLUSIVE`.

Expected: `REJECT [ADRT010]`.

### ADRT-FIX-042 — Deprecation sin alternativa/retiro

Expected: `REJECT [ADRT010]`.

### ADRT-FIX-043 — Superseded sin successor recíproco

Expected: `REJECT [ADRT010]`.

### ADRT-FIX-044 — Supersession cycle

Expected: `REJECT [ADRT010]`.

## Deciders, review, refs y seguridad

### ADRT-FIX-045 — Accepted con deciders UNASSIGNED

Expected: `REJECT [ADRT011]`.

### ADRT-FIX-046 — Self-review/conflict

Expected: `REJECT [ADRT011]`.

### ADRT-FIX-047 — Assignment expirado/stale

Expected: `REJECT [ADRT011]`.

### ADRT-FIX-048 — Accepted revision corta/inexistente

Expected: `REJECT [ADRT012]`.

### ADRT-FIX-049 — Related spec/ADR inexistente

Expected: `REJECT [ADRT012]`.

### ADRT-FIX-050 — Review stale por cambio

Expected: `MARK_STALE [ADRT012]`.

### ADRT-FIX-051 — Secret/PII

Expected: `REJECT [ADRT012]`.

### ADRT-FIX-052 — Orden variable

Mismo assessment/refs en distinto orden.

Expected: serialización/report byte-idéntico; de lo contrario `REJECT [ADRT012]`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| válidos/change classes | 001–012 |
| metadata/template | 013–017 |
| contexto/opciones | 018–023 |
| decisión/consecuencias | 024–030 |
| acceptance/evidence/rollback | 031–037 |
| change/lifecycle | 038–044 |
| deciders/refs/security | 045–052 |

Todos los códigos `ADRT001`–`ADRT012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Proposed/accepted y seis change classes cubiertos.
- [x] Contexto, opciones, consecuencias y evidence cubiertos.
- [x] Readiness, lifecycle y supersession cubiertos.
- [x] Deciders, refs, seguridad y determinismo cubiertos.
- [x] Doce códigos cubiertos.
- [ ] Materializar ADRs/assessments/expected reports.
- [ ] Aprobar contrato/catalog mediante DOC-REV.
- [ ] Crear template/parser sólo después de aprobación.

Los últimos tres checks permanecen abiertos.

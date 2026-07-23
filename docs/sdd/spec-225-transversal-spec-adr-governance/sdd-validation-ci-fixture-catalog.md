# Catálogo de fixtures SDDCI schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para la integración CI del validador SDD. Workflows, providers y
runs son simulados; este catálogo no crea `.github` ni ejecuta CI.

## Formato

```yaml
id: SDDCI-FIX-NNN
kind: POSITIVE | NEGATIVE | TRUST | RATCHET | CONCURRENCY | DETERMINISM
input:
  event: <evento/ref/sha>
  workflow: <config lógica>
  validatorRun: <resultado simulado>
  aggregator: <config/inputs>
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  checkOutcome: <enum>
  codes: [SDDCIxxx]
```

## Flujos válidos

### SDDCI-FIX-001 — PR interno PASS

Checkout del SHA exacto, lockfile/runtime fijos, validator read-only/offline, report completo.

Expected: `sdd-static=PASS`, aggregator satisfecho en ratchet/strict según baseline.

### SDDCI-FIX-002 — PR de fork seguro

Permisos read-only, secrets vacíos, mismo validator.

Expected: `PASS`; ninguna capacidad privilegiada.

### SDDCI-FIX-003 — Push main

Commit integrado exacto, report/evidence durable.

Expected: `PASS`.

### SDDCI-FIX-004 — Shadow con findings

Validator produce findings legacy/nuevos.

Expected: report visible; no branch gate, nunca etiqueta validación global como clean.

### SDDCI-FIX-005 — Ratchet con deuda estable

Findings coinciden con baseline, cero nuevos/drift.

Expected: `PASS`.

### SDDCI-FIX-006 — Ratchet con reducción

Una entry resuelta/retirada correctamente.

Expected: `PASS`; baseline delta negativo.

### SDDCI-FIX-007 — Strict limpio

Baseline errors cero y run sin errors.

Expected: `PASS`.

### SDDCI-FIX-008 — Warning permitido

Policy admite warning específico; cero error nuevo.

Expected: `PASS` con warning visible.

### SDDCI-FIX-009 — Re-run mismo SHA/config

Primer intento infra error, segundo pasa con mismos inputs.

Expected: latest successful attempt satisface check, historia conservada.

### SDDCI-FIX-010 — Cancelación obsoleta

Commit B cancela run de A; B finaliza PASS.

Expected: candidate B satisfecho, A queda CANCELLED.

## Workflow, eventos y trust

### SDDCI-FIX-011 — Job/check ausente

Expected: `REJECT [SDDCI001]`.

### SDDCI-FIX-012 — Evento PR omitido

Expected: `REJECT [SDDCI001]`.

### SDDCI-FIX-013 — Path filter saltea docs/código

Expected: `REJECT [SDDCI001]`; todo PR ejecuta `sdd-static`.

### SDDCI-FIX-014 — Schedule XURL mezclado

Job SDD estático ejecuta auditor de red.

Expected: `REJECT [SDDCI001, SDDCI006]`.

### SDDCI-FIX-015 — Write permissions

Workflow concede contents/checks/id-token write sin necesidad.

Expected: `REJECT [SDDCI002]`.

### SDDCI-FIX-016 — Secrets en fork

Expected: `REJECT [SDDCI002]`.

### SDDCI-FIX-017 — Código desde comentario/label

Expected: `REJECT [SDDCI002]`.

### SDDCI-FIX-018 — Credentials persistentes

Checkout mantiene token escribible.

Expected: `REJECT [SDDCI002]`.

## Runtime y subject

### SDDCI-FIX-019 — Runtime/action mutable

Node/action/dependency usa `latest`, branch o tag mutable no aprobado.

Expected: `REJECT [SDDCI003]`.

### SDDCI-FIX-020 — Install sin lockfile

Expected: `REJECT [SDDCI003]`.

### SDDCI-FIX-021 — Cache key incompleta

No incluye runtime/lockfile o cache puede contaminar trust boundary.

Expected: `REJECT [SDDCI003, SDDCI010]`.

### SDDCI-FIX-022 — SHA equivocado

Validator/report de commit A intenta satisfacer candidate B.

Expected: `REJECT [SDDCI004]`.

### SDDCI-FIX-023 — Config/baseline mismatch

Hashes pertenecen a otra revisión/scope.

Expected: `MARK_STALE [SDDCI004]`.

### SDDCI-FIX-024 — Merge group usa branch head

No valida SHA sintético.

Expected: `REJECT [SDDCI004]`.

## Outcomes, writes y red

### SDDCI-FIX-025 — Exit 1 marcado PASS

Expected: `REJECT [SDDCI005]`.

### SDDCI-FIX-026 — Findings errors con PASS

Expected: `REJECT [SDDCI005]`.

### SDDCI-FIX-027 — Report/console contradicen

Expected: `REJECT [SDDCI005]`.

### SDDCI-FIX-028 — Validator escribe

Modifica índice, baseline, metadata o artifacts del repo.

Expected: `FAIL/REJECT [SDDCI006]`.

### SDDCI-FIX-029 — Validator intenta red

Expected: `FAIL/REJECT [SDDCI006]`.

### SDDCI-FIX-030 — Instalación y validator no aislados

Proceso validator hereda egress abierto.

Expected: `REJECT [SDDCI006]`.

## Baseline y aggregator

### SDDCI-FIX-031 — Finding nuevo baselineado en el PR

Expected: `REJECT [SDDCI007]`.

### SDDCI-FIX-032 — Excepción vencida/sin owner

Expected: `REJECT [SDDCI007]`.

### SDDCI-FIX-033 — Baseline generado por run previo

Expected: `REJECT [SDDCI007]`; debe venir versionado en subject commit.

### SDDCI-FIX-034 — Finding movido de línea

Identidad semántica igual.

Expected: `ACCEPT`; no es deuda nueva.

### SDDCI-FIX-035 — Finding cambia target/code

Expected: `REJECT [SDDCI007]`.

### SDDCI-FIX-036 — Missing gate como PASS

Expected: `REJECT [SDDCI008]`.

### SDDCI-FIX-037 — CANCELLED/BLOCKED/INFRA como PASS

Expected: `REJECT [SDDCI008]`.

### SDDCI-FIX-038 — NOT_APPLICABLE en PR

Expected: `REJECT [SDDCI008]`.

### SDDCI-FIX-039 — Aggregator de otro SHA

Expected: `REJECT [SDDCI008, SDDCI004]`.

## Concurrency y reruns

### SDDCI-FIX-040 — Último candidate cancelado

No existe successor run.

Expected: `REJECT [SDDCI009]`.

### SDDCI-FIX-041 — PR y merge-group comparten group

Se cancelan entre sí.

Expected: `REJECT [SDDCI009]`.

### SDDCI-FIX-042 — Re-run con config distinta oculto

Expected: `REJECT [SDDCI009]`; registrar nuevos hashes/attempt.

### SDDCI-FIX-043 — Dos PASS, orden variable

Aggregator elige por llegada y produce outcomes distintos.

Expected: `REJECT [SDDCI009]`; selección determinista por SHA/attempt policy.

## Artifacts, logs y cache

### SDDCI-FIX-044 — Artifact completo

Cuatro artifacts lógicos, hashes/paths relativos/redacción válidos.

Expected: `ACCEPT`.

### SDDCI-FIX-045 — Artifact obligatorio ausente

Expected: `INFRA_ERROR/REJECT [SDDCI010]`.

### SDDCI-FIX-046 — Secret/PII/path absoluto

Expected: `REJECT [SDDCI010]`; output redactado.

### SDDCI-FIX-047 — Cache envenenada

Cache de fork no confiable restaura executable/output privilegiado.

Expected: `REJECT [SDDCI010, SDDCI002]`.

### SDDCI-FIX-048 — Annotations masivas

Miles de comentarios/annotations sin agregación.

Expected: `REJECT [SDDCI010]`.

## Rollout, canarios y operación

### SDDCI-FIX-049 — Ratchet required sin canarios

Expected: `REJECT [SDDCI011]`.

### SDDCI-FIX-050 — Strict con baseline no cero

Expected: `REJECT [SDDCI011]`.

### SDDCI-FIX-051 — Branch protection declarado sin evidencia

Expected: `REJECT [SDDCI011]`.

### SDDCI-FIX-052 — Canary no falla

ID duplicado/link roto/etc. pasa.

Expected: `REJECT [SDDCI011]`.

### SDDCI-FIX-053 — Timeout sin medición

Required job adopta límite arbitrario que causa flakiness.

Expected: `REJECT [SDDCI012]`.

### SDDCI-FIX-054 — Provider outage como PASS

Expected: `REJECT [SDDCI012]`; outcome `INFRA_ERROR`.

### SDDCI-FIX-055 — Desactivar gate como rollback

Sin emergency record/follow-up.

Expected: `REJECT [SDDCI012]`.

### SDDCI-FIX-056 — Budget medido válido

Duración/artifacts/cache/minutes medidos, owner/policy y timeout con margen.

Expected: `ACCEPT`.

### SDDCI-FIX-057 — Orden de findings variable

Mismo commit/config produce stdout/report distinto.

Expected: `REJECT [SDDCI012]`.

### SDDCI-FIX-058 — Artifact retention indefinida

Sin policy/budget.

Expected: `REJECT [SDDCI012]`.

### SDDCI-FIX-059 — Validator defectuoso blanket ignored

Expected: `REJECT [SDDCI012]`.

### SDDCI-FIX-060 — Emergency controlado

Change record autorizado, gates mínimos conservados, follow-up y reactivación definidos.

Expected: `ACCEPT` sólo bajo SPEC-221; no convierte fallo previo en PASS.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| válidos | 001–010, 034, 044, 056, 060 |
| workflow/trust | 011–018 |
| runtime/subject | 019–024 |
| outcomes/write/network | 025–030 |
| baseline/aggregator | 031–039 |
| concurrency | 040–043 |
| artifacts/cache | 044–048 |
| rollout/operation | 049–060 |

Todos los códigos `SDDCI001`–`SDDCI012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Eventos, forks, permisos y runtime cubiertos.
- [x] SHA, outcomes, writes, red y baseline cubiertos.
- [x] Aggregator, concurrency, artifacts y cache cubiertos.
- [x] Rollout, canarios, budget y emergency cubiertos.
- [x] Doce códigos cubiertos.
- [ ] Materializar workflow/run/expected check fixtures.
- [ ] Aprobar contrato/catalog mediante DOC-REV.
- [ ] Implementar CI sólo después de validator/canarios.

Los últimos tres checks permanecen abiertos.

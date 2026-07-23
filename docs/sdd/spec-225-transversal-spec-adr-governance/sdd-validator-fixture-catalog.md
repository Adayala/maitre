# Catálogo de fixtures del validador SDD/ADR — SPEC-225

## Propósito

Definir casos de aceptación para los códigos públicos `SDD001`–`SDD008` y `ADR001/002`. Los
subcódigos especializados aportan diagnóstico; este catálogo valida el resultado integrado.

No implementa `npm run sdd:validate`.

## Formato

```yaml
id: SDDV-FIX-NNN
kind: POSITIVE | NEGATIVE | BASELINE | DETERMINISM | SECURITY
tree: <repositorio mínimo>
config: <schema/aliases/scope>
baseline: [<findings>]
expected:
  exitCode: 0 | 1
  publicCodes: [SDDxxx | ADRxxx]
  detailCodes: [<subcódigos>]
  writes: 0
  networkRequests: 0
```

Los fixtures ejecutables usan commits/blobs/IDs válidos y expected stdout byte-exacto.

## Repositorios válidos

### SDDV-FIX-001 — Spec mínima válida

README con ID/path/metadata canónica, nueve artifacts presentes, links y registro coherentes.

Expected: exit 0.

### SDDV-FIX-002 — ADR proposed válido

Metadata completa, deciders `UNASSIGNED` con blocker, secciones/readiness aplicables.

Expected: exit 0.

### SDDV-FIX-003 — ADR accepted válido

Deciders, accepted revision, DOC-REV, related specs y readiness completos.

Expected: exit 0.

### SDDV-FIX-004 — Legacy baselineado

Finding preexistente coincide semánticamente con baseline vigente/issue/owner/retiro.

Expected: exit 0 con finding visible; baseline no lo convierte en válido.

### SDDV-FIX-005 — Reducción de baseline

Se resuelve un finding y se retira su entry.

Expected: exit 0; conteo decrece.

### SDDV-FIX-006 — START_HERE curado

START_HERE no lista todas las specs, pero sus links/sections declaradas coinciden con config.

Expected: exit 0; no exige cobertura global que corresponde a INDEX/SPECS.

### SDDV-FIX-007 — Worktree audit separado

Commit gate válido; worktree dirty audit produce reporte separado.

Expected: commit gate exit 0; auditoría no reemplaza resultado.

### SDDV-FIX-008 — Warning no bloqueante

Warning permitido, cero errors nuevos.

Expected: exit 0 y warning visible.

## SDD001 — Identidad

### SDDV-FIX-009 — ID duplicado

Expected: exit 1 `[SDD001]`.

### SDDV-FIX-010 — ID inválido/filename mismatch

Expected: exit 1 `[SDD001]`.

### SDDV-FIX-011 — ID retirado reutilizado

Expected: exit 1 `[SDD001]`.

### SDDV-FIX-012 — Collision registry/envelope

Expected: exit 1 `[SDD001]`, detalle `DOCM003` o `DIDA002`.

## SDD002 — Slug/directorio

### SDDV-FIX-013 — Slug duplicado

Expected: exit 1 `[SDD002]`.

### SDDV-FIX-014 — Directorio no coincide

README SPEC-010 vive bajo `spec-011-*`.

Expected: exit 1 `[SDD002]`.

### SDDV-FIX-015 — Renombre parcial

Directorio cambia sin actualizar registro/links.

Expected: exit 1 `[SDD002, SDD008]`.

## SDD003 — Metadata/estado

### SDDV-FIX-016 — Campo requerido ausente

Expected: exit 1 `[SDD003]`.

### SDDV-FIX-017 — Estado desconocido

Expected: exit 1 `[SDD003]`.

### SDDV-FIX-018 — Estado compuesto

`DRAFT — READY FOR I0 REVIEW`.

Expected: exit 1 `[SDD003, SDD007]`.

### SDDV-FIX-019 — Alias de campo no configurado

Expected: exit 1 `[SDD003]`; parser no adivina nombres.

### SDDV-FIX-020 — Metadata documental inválida

Envelope activo con role/status incompatible.

Expected: exit 1 `[SDD003]`, detalle `DOCM005`.

## SDD004 — Artifacts mínimos

### SDDV-FIX-021 — Archivo ausente

Expected: exit 1 `[SDD004]`.

### SDDV-FIX-022 — Archivo vacío

Expected: exit 1 `[SDD004]`.

### SDDV-FIX-023 — Placeholder corrupto

Token/template no instanciado en artifact requerido.

Expected: exit 1 `[SDD004]`.

### SDDV-FIX-024 — Template explícito no registrable

Template físico correctamente clasificado/excluido.

Expected: exit 0; no se confunde con spec/ADR real.

## SDD005 — Links/referencias

### SDDV-FIX-025 — Link relativo roto

Expected: exit 1 `[SDD005]`, detalle `NAVL001`.

### SDDV-FIX-026 — Fragment inválido

Profile activo, heading ID ausente.

Expected: exit 1 `[SDD005]`, detalle `NAVL006`.

### SDDV-FIX-027 — Referencia spec inexistente

Expected: exit 1 `[SDD005]`.

### SDDV-FIX-028 — Referencia tipada inválida

Expected: exit 1 `[SDD005]`, detalle `DREF002/003`.

### SDDV-FIX-029 — URL externa offline

Expected: PR gate no solicita red; URL pasa a static XURL classification/job separado.

## SDD006 — Dependencias/successors/cycles

### SDDV-FIX-030 — Dependencia inexistente

Expected: exit 1 `[SDD006]`.

### SDDV-FIX-031 — Cycle prohibido

Expected: exit 1 `[SDD006]` con path completo del ciclo.

### SDDV-FIX-032 — Successor inexistente

Expected: exit 1 `[SDD006]`.

### SDDV-FIX-033 — Cycle sólo navegación

Expected: exit 0 para dependencia/authority; NAV puede informar ciclo no bloqueante.

### SDDV-FIX-034 — N/A versus UNASSESSED

Valor canónico se conserva; ausencia/no evaluado no se convierte en N/A.

Expected: exit según metadata contract, sin inferencia automática.

## SDD007 — Lifecycle/readiness/evidence

### SDDV-FIX-035 — Ready sin owner

Expected: exit 1 `[SDD007]`.

### SDDV-FIX-036 — Ready con blocker P0

Expected: exit 1 `[SDD007]`.

### SDDV-FIX-037 — Verified sin evidence

Expected: exit 1 `[SDD007]`.

### SDDV-FIX-038 — Deprecated sin retiro

Expected: exit 1 `[SDD007]`.

### SDDV-FIX-039 — Checkbox auto-promueve

Expected: exit 1 `[SDD007]`; checkbox no cambia lifecycle.

### SDDV-FIX-040 — Walking skeleton como readiness

Valor de fase aparece en readiness.

Expected: exit 1 `[SDD007]` salvo baseline migratorio exacto, siempre visible.

## SDD008 — Proyecciones/drift

### SDDV-FIX-041 — Registry versus INDEX

ID/path/status difieren.

Expected: exit 1 `[SDD008]`.

### SDDV-FIX-042 — Catálogo con override manual

Expected: exit 1 `[SDD008]`.

### SDDV-FIX-043 — Output generado stale

Expected: exit 1 `[SDD008]`; CI no lo regenera.

### SDDV-FIX-044 — Orden no determinista

Expected: exit 1 `[SDD008]`.

### SDDV-FIX-045 — START_HERE claim incorrecto

Sección declara cobertura/estado que contradice registro.

Expected: exit 1 `[SDD008]`; no por omitir specs fuera de su scope curado.

## ADR001/ADR002

### SDDV-FIX-046 — ADR ID/status inválido

Expected: exit 1 `[ADR001]`.

### SDDV-FIX-047 — Proposed sin decider y sin blocker

Expected: exit 1 `[ADR001]`.

### SDDV-FIX-048 — Accepted sin revision/readiness

Expected: exit 1 `[ADR001]`, detalle `ADRT007/010/011`.

### SDDV-FIX-049 — Related spec ausente

Expected: exit 1 `[ADR002]`.

### SDDV-FIX-050 — ADR successor inválido/cíclico

Expected: exit 1 `[ADR002]`, detalle `ADRT010`.

### SDDV-FIX-051 — ADR index drift

Expected: exit 1 `[ADR002]`.

## Baseline, seguridad y determinismo integrado

### SDDV-FIX-052 — Finding nuevo

No coincide con baseline.

Expected: exit 1 con public/detail code.

### SDDV-FIX-053 — Baseline crece

Se agrega excepción para aprobar el mismo cambio.

Expected: exit 1.

### SDDV-FIX-054 — Finding movido de línea

Identidad semántica igual, línea cambia.

Expected: no se considera finding nuevo.

### SDDV-FIX-055 — Finding cambia target/code

Mismo baseline ID.

Expected: exit 1 por drift.

### SDDV-FIX-056 — Sin red

Fixture configura endpoint externo que colgaría/fallaría.

Expected: network requests 0; resultado del PR determinista.

### SDDV-FIX-057 — Read-only

Inputs inválidos.

Expected: exit 1, writes 0; no arregla metadata/links/índices.

### SDDV-FIX-058 — Secret en input/report

Expected: exit 1 con subcódigo especializado; output redactado.

### SDDV-FIX-059 — Orden de filesystem variable

Mismo commit/config en órdenes distintos.

Expected: stdout comparable byte-idéntico.

### SDDV-FIX-060 — Config/schema cambia

Baseline/report de scope anterior se reutiliza.

Expected: exit 1 por staleness/drift.

## Matriz de cobertura

| Código/área | Fixtures |
| --- | --- |
| válidos | 001–008, 024, 029, 033–034 |
| `SDD001` | 009–012 |
| `SDD002` | 013–015 |
| `SDD003` | 016–020 |
| `SDD004` | 021–024 |
| `SDD005` | 025–029 |
| `SDD006` | 030–034 |
| `SDD007` | 035–040 |
| `SDD008` | 041–045 |
| `ADR001/002` | 046–051 |
| baseline/security/determinism | 052–060 |

Todos los códigos públicos poseen caso positivo integrado y al menos un caso negativo.

## Criterios de salida

- [x] Diez códigos públicos cubiertos.
- [x] Public/detail codes integrados.
- [x] Baseline, cycles, lifecycle, ADRs y ausencia de red cubiertos.
- [x] Read-only y salida determinista especificados.
- [ ] Materializar repositorios mínimos/expected stdout.
- [ ] Aprobar catálogo y baseline policy.
- [ ] Implementar validador sólo después de aprobación.

Los últimos tres checks permanecen abiertos.

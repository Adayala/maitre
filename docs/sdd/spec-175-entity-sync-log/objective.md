# Objetivo — SPEC-175

Definir checkpoint, run y log de sincronización con promoción atómica de cursor y evidencia append-only.

## Criterios de aceptación

### CAD-175-01 — `SyncCheckpoint` es autoridad por integración, recurso, dirección y partición

`SyncCheckpoint` es autoridad por integration+resource+direction+partition con
cursor/version actual, lease owner/expiry y updatedAt.

### CAD-175-02 — `SyncRun` congela cursor original/candidato, mode, policy y outcome

`SyncRun` congela original cursor, candidate cursor, mode, policy, counts, outcome y
correlation para una ejecución determinada.

### CAD-175-03 — Lease bloquea runs incompatibles sobre la misma partición

lease impide runs incompatibles sobre la misma partición o checkpoint.

### CAD-175-04 — Candidate cursor se promueve sólo tras persistencia completa confirmada

candidate cursor sólo se promueve atómicamente después de persistir todos los writes
confirmados del boundary.

### CAD-175-05 — Partial failures preservan checkpoint o usan sub-checkpoints explícitos

partial failures preservan el checkpoint anterior o usan sub-checkpoints explícitos;
`SyncLog` es append-only y no coordina ejecución.

### CAD-175-06 — La aprobación exige evidencia de leases, atomic promotion y logs redactados

La aprobación exige fixtures de leases, partial failure, atomic promotion, sub-checkpoints,
redacción de logs y runs incompatibles.

# Verificación — SPEC-175

## Criterios

### CAD-175-01 — `SyncCheckpoint` es autoridad por integración, recurso, dirección y partición

- [ ] checkpoint define autoridad por integración/recurso/dirección/partición.

### CAD-175-02 — `SyncRun` congela cursor original/candidato, mode, policy y outcome

- [ ] sync run congela cursor original/candidato, mode, policy y outcomes.

### CAD-175-03 — Lease bloquea runs incompatibles sobre la misma partición

- [ ] lease bloquea runs incompatibles.

### CAD-175-04 — Candidate cursor se promueve sólo tras persistencia completa confirmada

- [ ] candidate cursor se promueve sólo tras persistencia completa confirmada.

### CAD-175-05 — Partial failures preservan checkpoint o usan sub-checkpoints explícitos

- [ ] partial failures preservan checkpoint o usan sub-checkpoints explícitos.

### CAD-175-06 — La aprobación exige evidencia de leases, atomic promotion y logs redactados

- [ ] fixtures cubren lease, parcialidad, promoción atómica y logs redactados.

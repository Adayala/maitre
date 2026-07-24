# Verificación — SPEC-070

## Criterios

### CAD-070-01 — Cada versión de policy conserva alcance, vigencia y reglas ordenadas

- [ ] versiones/alcances/intervalos inválidos o ambiguos se rechazan.

### CAD-070-02 — Las reservations confirmadas congelan su policy version

- [ ] Reservations confirmadas mantienen su policy version y resultado histórico.

### CAD-070-03 — Evaluate es una función pura y explicable

- [ ] evaluate es reproducible, explicable y libre de writes.

### CAD-070-04 — Reglas solapadas y bordes temporales se resuelven determinísticamente

- [ ] golden boundaries de DST/ventanas/precedence son deterministas.

### CAD-070-05 — I0 clasifica cancelaciones sin ejecutar cobros ni overrides implícitos

- [ ] override respeta permiso/alcance/expiry/approval sin cobrar penalidad.

### CAD-070-06 — La aprobación exige evidencia de snapshots, boundaries y aislamiento

- [ ] publicación concurrente, revisión, auditoría y aislamiento poseen evidencia.

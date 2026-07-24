# Objetivo — SPEC-081

Definir Order como agregado comercial autoritativo de una Visit con submit, snapshots y totales
determinísticos.

## Criterios de aceptación

### CAD-081-01 — El alcance de Order queda fijado al crear y nunca muta

tenant, brand, branch y el alcance de visit quedan fijados al crear el Order y nunca mutan.

### CAD-081-02 — Los estados autoritativos y derivados tienen precedencia reproducible

estados autoritativos, estados derivados y precedencia de derivación son inequívocos y
reproducibles.

### CAD-081-03 — Submit revalida catálogo y congela snapshot con idempotencia

submit revalida catálogo, pricing, impuestos, moneda y restricciones con idempotencia y
freeze explícito del snapshot.

### CAD-081-04 — Los cambios post-submit se modelan como ajustes auditados

cambios posteriores a submit se modelan como ajustes auditados sin reescribir el snapshot
histórico.

### CAD-081-05 — Order conserva su frontera comercial sin asumir autoridad fiscal

totales, revisiones y relación con Check/Fiscal quedan acotados sin convertir Order en
autoridad fiscal.

### CAD-081-06 — La aprobación exige evidencia de submit, catálogo y concurrencia

La aprobación exige fixtures de doble submit, catálogo cambiado, cancelación, cross-scope,
derivación y concurrencia.

# Objetivo — SPEC-179

Definir la API de sincronización manual/controlada con leases, retries seguros y promoción consistente
de cursores.

## Criterios de aceptación

### CAD-179-01 — La API permite start, get run y retry de particiones recuperables

la API permite start full/incremental, get run y retry recoverable partition.

### CAD-179-02 — `start` es idempotente, adquiere lease y rechaza runs incompatibles

`start` es idempotente, adquiere lease y rechaza runs incompatibles.

### CAD-179-03 — Full/backfill no pisa cursor incremental sin policy explícita

full/backfill no reemplaza cursor incremental sin policy explícita aprobada.

### CAD-179-04 — Writes siguen OwnershipMatrix e ID mapping con avance de cursor correcto

writes aplican OwnershipMatrix y external ID mapping mientras el cursor avanza según
SPEC-175.

### CAD-179-05 — `PARTIAL` y cancel reportan estado y liberan lease de forma segura

`PARTIAL` declara partitions/counts/errors y no se etiqueta success; cancel detiene
próximos batches y libera lease de forma segura.

### CAD-179-06 — La aprobación exige evidencia de leases, partial, cancel y retries sin duplicación

La aprobación exige fixtures de idempotencia, leases, backfill policy, partial, cancel y
retry sin duplicar side effects.

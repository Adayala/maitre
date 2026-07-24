# Verificación — SPEC-179

## Criterios

### CAD-179-01 — La API permite start, get run y retry de particiones recuperables

- [ ] recursos cubren start, get run y retry de particiones recuperables.

### CAD-179-02 — `start` es idempotente, adquiere lease y rechaza runs incompatibles

- [ ] `start` es idempotente y respeta leases.

### CAD-179-03 — Full/backfill no pisa cursor incremental sin policy explícita

- [ ] full/backfill no pisa cursor incremental sin policy explícita.

### CAD-179-04 — Writes siguen OwnershipMatrix e ID mapping con avance de cursor correcto

- [ ] writes siguen ownership matrix e ID mapping con avance de cursor correcto.

### CAD-179-05 — `PARTIAL` y cancel reportan estado y liberan lease de forma segura

- [ ] `PARTIAL` y cancel reportan estado y liberan lease de forma segura.

### CAD-179-06 — La aprobación exige evidencia de leases, partial, cancel y retries sin duplicación

- [ ] fixtures cubren lease conflict, partial, cancel y retries sin duplicación.

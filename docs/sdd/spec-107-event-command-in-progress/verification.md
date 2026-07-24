# Verificación — SPEC-107

## Criterios

### CAD-107-01 — La frontera entre claim e `IN_PROGRESS` queda definida inequívocamente

- [ ] claim e in-progress tienen fronteras normativas distintas.

### CAD-107-02 — La transición efectiva a `IN_PROGRESS` emite un único hecho

- [ ] cada transición lógica a `IN_PROGRESS` emite un único hecho observable.

### CAD-107-03 — El payload incluye owner, station y revisiones suficientes

- [ ] payload expone owner, station, timestamp y revisión suficientes.

### CAD-107-04 — Transferencias posteriores no reescriben el hecho original

- [ ] transferencias posteriores no reescriben ni duplican el inicio.

### CAD-107-05 — Retry, rollback y reorder convergen sin duplicar inicio efectivo

- [ ] retry, rollback y reorder convergen con dedupe.

### CAD-107-06 — La aprobación exige evidencia de claims concurrentes, transfer y dedupe

- [ ] fixtures cubren claims concurrentes, transfer y aislamiento.

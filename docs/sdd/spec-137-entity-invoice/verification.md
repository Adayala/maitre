# Verificación — SPEC-137

## Criterios

### CAD-137-01 — Lifecycle, terminalidad y `PENDING_RECONCILIATION` quedan definidos sin ambigüedad

- [ ] lifecycle y `PENDING_RECONCILIATION` son inequívocos y terminales cuando aplica.

### CAD-137-02 — La identidad fiscal única queda congelada y no colisiona

- [ ] identidad fiscal única no colisiona por ambiente/entidad/POS/tipo/número.

### CAD-137-03 — AUTHORIZED congela el snapshot fiscal completo

- [ ] AUTHORIZED congela snapshot fiscal completo y source revision.

### CAD-137-04 — Una invoice autorizada nunca se cancela ni edita in-place

- [ ] correcciones sólo usan notas referenciadas, sin edición destructiva.

### CAD-137-05 — Tenant isolation, PII y fiscal data aplican en drafts y retries

- [ ] tenant isolation y PII protegen drafts, retries y documentos autorizados.

### CAD-137-06 — La aprobación exige evidencia de unicidad, precisión e aislamiento

- [ ] fixtures cubren unicidad, idempotencia, precisión y aislamiento.

# Objetivo — SPEC-183

Definir el conector contable con autoridad fiscal/operativa local y autoridad remota de posting/closed-period
remota, preservando batches versionados.

## Criterios de aceptación

### CAD-183-01 — El conector cubre export contable e import de acknowledgements

el conector exporta journals/invoices/taxes/settlements e importa acknowledgements.

### CAD-183-02 — La matriz de autoridad separa fiscal/operativo local de posting/closed-period remoto

Maitre es autoridad fiscal y operativa; el provider es autoridad de external ID, posting
result y closed-period response.

### CAD-183-03 — Mapping version queda congelado por batch

mapping versionado define accounts/tax codes/currency y se congela por batch.

### CAD-183-04 — Partial batch conserva item outcomes y retries no repostean accepted IDs

partial batch conserva item outcomes y `retry` no repostea accepted IDs.

### CAD-183-05 — Closed periods generan ajuste o reconciliación, no reescritura histórica

closed periods generan reconciliation o next-period adjustment, nunca reescritura
histórica; CSV/manual export existe como fallback.

### CAD-183-06 — La aprobación exige evidencia de parciales, closed periods y fallback manual

La aprobación exige fixtures de batches parciales, accepted IDs, closed periods, mapping
version y fallback manual.

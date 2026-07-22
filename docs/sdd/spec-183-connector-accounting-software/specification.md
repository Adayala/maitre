# Especificación — SPEC-183 Accounting Connector

Exporta journal/invoices/taxes/settlements e importa acknowledgements. Maitre es autoridad fiscal y
operativa; provider es autoridad de external ID/posting/closed-period response. Mapping versionado
define accounts/tax codes/currency y se congela por batch.

Partial batch conserva item outcomes; retry no repostea accepted IDs. Closed periods generan
reconciliation/next-period adjustment, nunca reescritura. Provider requiere spike PASS; CSV/manual
export es fallback.

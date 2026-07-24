# Especificación — SPEC-183 Accounting Connector

Exporta journal/invoices/taxes/settlements e importa acknowledgements. Maitre es autoridad fiscal y
operativa; provider es autoridad de external ID/posting/closed-period response. Mapping versionado
define accounts/tax codes/currency y se congela por batch.

Partial batch conserva item outcomes; retry no repostea accepted IDs. Closed periods generan
reconciliation/next-period adjustment, nunca reescritura. Provider requiere spike PASS; CSV/manual
export es fallback.

La unidad de envío contable es el batch materializado con una `mappingVersion` explícita. Cambios en
cuentas, códigos impositivos o moneda después de emitido el batch no reescriben el batch original; se
resuelven con nuevos batches o asientos de ajuste según policy.

El conector debe distinguir claramente entre “aceptado por item”, “aceptado por batch” y “cerrado por
período”. Un período cerrado remoto no es un error genérico: es una respuesta de negocio que obliga a
un camino de reconciliación o ajuste explícito.

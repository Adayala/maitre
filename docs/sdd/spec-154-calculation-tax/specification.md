# Especificación — SPEC-154 Tax Calculation

Función pura sobre InvoiceLine inputs, DiscountApplications, TaxRateVersions y MoneyPolicy.
Calcula base por treatment, tax por rate, gross y residuos con decimal; importes del cliente no son
autoridad.

Convención y orden coinciden con Catalog/Order/Check. Credit/debit reproduce el snapshot original y
aplica signo por documento. Resultado conserva ecuaciones, input hash y normative versions; sumas
por línea/tasa deben reconciliar exactamente con Invoice.

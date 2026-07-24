# Especificación — SPEC-154 Tax Calculation

Función pura sobre InvoiceLine inputs, DiscountApplications, TaxRateVersions y MoneyPolicy.
Calcula base por treatment, tax por rate, gross y residuos con decimal; importes del cliente no son
autoridad.

Convención y orden coinciden con Catalog/Order/Check. Credit/debit reproduce el snapshot original y
aplica signo por documento. Resultado conserva ecuaciones, input hash y normative versions; sumas
por línea/tasa deben reconciliar exactamente con Invoice.

La salida incluye totales por línea, agrupaciones por tasa/tratamiento, residuos explícitos,
equaciones auditables y referencias a las versiones normativas utilizadas. El cálculo no depende de
estado externo mutable una vez fijado el snapshot de entrada; mismo input produce idéntico output.

Cuando la normativa exige cálculo tax-included o tax-excluded, la función debe respetar el tratamiento
de cada línea y documentar la asignación de residuos si aparecen. Las notas de crédito y débito usan
la misma trazabilidad que el documento origen y no pueden inventar una distribución incompatible con
el snapshot fiscal previamente aceptado.

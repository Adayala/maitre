# Especificación — SPEC-138 InvoiceLineItem

Snapshot fiscal inmutable: description, quantity decimal, unit, unit net/gross, discounts,
TaxRateVersion, taxable/exempt/non-taxed bases, tax y total minor units. Conserva source Check line
y DiscountApplication refs.

Por línea: `net after discounts = taxable + exempt + nonTaxed`; `gross = net after discounts + tax`.
La suma de líneas y residuos explícitos debe reconciliar exactamente con Invoice. Credit/DebitNote
usa importes firmados por tipo documental, nunca quantity/precio ambiguamente negativos.

Cada InvoiceLineItem conserva `description`, `quantity`, `unit`, `unitNet`, `unitGross`,
`discountsApplied`, `taxRateVersion`, `taxableBase`, `exemptBase`, `nonTaxedBase`, `taxAmount`,
`grossTotal`, `sourceCheckLineRef` y `discountApplicationRefs`. El snapshot es fiscal y no depende
de que el catálogo, el check o las políticas futuras sigan existiendo en el mismo estado.

La semántica monetaria es exacta y versionada por MoneyPolicy/NormativePolicy. Los residuos o
ajustes de redondeo se declaran explícitamente donde corresponda para que la suma de líneas
reconcilie exactamente con la Invoice. En Credit/DebitNote, el signo económico vive en el tipo
documental y sus bases, no en cantidades o precios ambiguamente negativos.

# Especificación — SPEC-138 InvoiceLineItem

Snapshot fiscal inmutable: description, quantity decimal, unit, unit net/gross, discounts,
TaxRateVersion, taxable/exempt/non-taxed bases, tax y total minor units. Conserva source Check line
y DiscountApplication refs.

Por línea: `net after discounts = taxable + exempt + nonTaxed`; `gross = net after discounts + tax`.
La suma de líneas y residuos explícitos debe reconciliar exactamente con Invoice. Credit/DebitNote
usa importes firmados por tipo documental, nunca quantity/precio ambiguamente negativos.

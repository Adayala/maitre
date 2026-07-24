# Reglas — SPEC-138

- Snapshot fiscal es inmutable tras emisión.
- `net after discounts = taxable + exempt + nonTaxed`.
- `gross = net after discounts + tax`.
- Líneas y residuos explícitos deben reconciliar con Invoice.
- Credit/DebitNotes no usan quantity/precio con signo ambiguo como semántica principal.

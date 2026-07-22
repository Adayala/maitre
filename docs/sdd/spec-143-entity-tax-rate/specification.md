# Especificación — SPEC-143 TaxRate

Catálogo normativo administrado por plataforma: jurisdiction, official code, treatment, decimal
rate, effective interval y NormativeSourceVersion. No hay solapamiento por clave y una versión usada
es inmutable.

Tenants sólo mapean Product/tax category a códigos permitidos; no crean alícuotas oficiales. Cambio
retroactivo crea versión y proceso de revisión, nunca reescribe invoices. Sin código vigente o
fuente aprobada se bloquea emisión.

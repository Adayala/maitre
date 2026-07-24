# Especificación — SPEC-143 TaxRate

Catálogo normativo administrado por plataforma: jurisdiction, official code, treatment, decimal
rate, effective interval y NormativeSourceVersion. No hay solapamiento por clave y una versión usada
es inmutable.

Tenants sólo mapean Product/tax category a códigos permitidos; no crean alícuotas oficiales. Cambio
retroactivo crea versión y proceso de revisión, nunca reescribe invoices. Sin código vigente o
fuente aprobada se bloquea emisión.

La entidad incluye `taxRateId`, `jurisdiction`, `taxType`, `officialCode`, `treatment`,
`decimalRate`, `includedInPrice`, `effectiveFrom`, `effectiveTo?`, `normativeSourceVersion`,
`status`, `supersedes?`, `createdAt`, `updatedAt` y `revision`. La precisión decimal es exacta y no
admite floats implícitos. `status` distingue borradores regulatorios de versiones aprobadas para
emisión.

Los mapeos operativos viven fuera de esta entidad: `Product`, `Category` o reglas fiscales internas
referencian `TaxRate` vigente, pero nunca copian ni mutan la definición oficial. La resolución de
impuestos para una invoice debe registrar qué versión normativa fue usada para permitir auditoría y
reproducibilidad histórica.

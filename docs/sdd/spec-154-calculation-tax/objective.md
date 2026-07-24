# Objetivo — SPEC-154

Definir el cálculo fiscal puro y reproducible de una invoice a partir de líneas, descuentos, tasas y
políticas monetarias, sin aceptar importes del cliente como autoridad.

## Criterios de aceptación

### CAD-154-01 — La función produce base, tax, gross y residuos determinísticos

la función recibe InvoiceLine inputs, DiscountApplications, TaxRateVersions y MoneyPolicy y
produce base imponible, tax, gross y residuos determinísticos.

### CAD-154-02 — Bases y tratamientos siguen versiones normativas; importes cliente no mandan

las bases y tratamientos siguen las versiones normativas aplicables; importes enviados por
el cliente nunca son fuente autoritativa.

### CAD-154-03 — Convención, orden y redondeo usan decimal exacto sin floats

convención, orden y redondeo coinciden con Catalog/Order/Check y usan decimal exacto sin
floats.

### CAD-154-04 — Credit/debit reproducen snapshot original con sign semantics correctas

credit/debit reproducen snapshot fiscal original y aplican signo/document semantics sin
recalcular arbitrariamente otra combinación.

### CAD-154-05 — El resultado conserva ecuaciones, hashes y reconcilia exactamente con Invoice

el resultado conserva ecuaciones, input hash y normative versions, y reconcilia exactamente
con totales de Invoice por línea, tasa y documento.

### CAD-154-06 — La aprobación exige evidencia de descuentos, tasas mixtas y reproducibilidad

La aprobación exige fixtures de descuentos, tasas mixtas, residuos, créditos/débitos,
rounding y reproducibilidad histórica.

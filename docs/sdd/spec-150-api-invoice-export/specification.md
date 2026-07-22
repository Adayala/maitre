# Especificación — SPEC-150 Invoice/Libro IVA Export

Job asíncrono por period, fiscalEntity, pointOfSale y format version. Incluye sólo AUTHORIZED y notas
autorizadas; pending/rejected aparecen en reporte de excepciones, no como ventas.

Manifest conserva counts, totals por voucher/tax/currency, input revision, layout normative version,
hash y errores. Signed download expira y se audita. Export significa archivo generado, nunca
presentación ante ARCA. Reconciliación exige sumas Invoice/notes = libro dentro de cero diferencia
salvo residuos explícitos de redondeo.

# Especificación — SPEC-150 Invoice/Libro IVA Export

Job asíncrono por period, fiscalEntity, pointOfSale y format version. Incluye sólo AUTHORIZED y notas
autorizadas; pending/rejected aparecen en reporte de excepciones, no como ventas.

Manifest conserva counts, totals por voucher/tax/currency, input revision, layout normative version,
hash y errores. Signed download expira y se audita. Export significa archivo generado, nunca
presentación ante ARCA. Reconciliación exige sumas Invoice/notes = libro dentro de cero diferencia
salvo residuos explícitos de redondeo.

La API expone `POST /invoice-exports` para solicitar jobs, `GET /invoice-exports` para listar estado,
`GET /invoice-exports/{exportId}` para detalle del manifest y `POST /invoice-exports/{exportId}:download`
para obtener un enlace o stream temporal según política de distribución. Repetir una solicitud
idéntica dentro de la misma intención puede reutilizar el mismo job o manifest si el input revision no
cambió.

Errores usan `404` para scope ajeno, `409` para conflicto de período/job activo incompatible, `412`
para input revision obsoleta y `422` para parámetros inválidos o datasets irreconciliables. La API no
presenta automáticamente nada ante ARCA ni marca `presented`; esa confirmación pertenece a otro
boundary operativo/auditado.

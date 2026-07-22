# Contrato API — SPEC-150 Invoice Export

Solicitar y descargar exportaciones deterministas de comprobantes y Libro IVA por período,
entidad fiscal, punto de venta y formato versionado. La generación asíncrona produce manifest,
conteos, totales, hash y errores por registro; un enlace firmado expira y no declara una
presentación realizada. Tests cubren volumen, reintento, corte temporal, encoding, layout,
reconciliación, permisos, retención y aislamiento.

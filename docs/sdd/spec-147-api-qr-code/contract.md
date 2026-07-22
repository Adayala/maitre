# Contrato API — SPEC-147 Fiscal QR Code

Obtener la representación fiscal QR de un comprobante autorizado en payload, SVG o imagen,
con content type, ETag y cache-control definidos. El servidor deriva datos del snapshot y
rechaza payloads suministrados por clientes; comprobantes pendientes o rechazados no generan
QR válido. Tests cubren formatos, encoding, determinismo, autorización, caché, redacción,
fixtures oficiales y aislamiento entre tenants.

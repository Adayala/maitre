# Especificación — SPEC-147 Fiscal QR API

GET payload/SVG/raster para Invoice AUTHORIZED, derivado server-side con SPEC-141. Pending, rejected
o draft devuelve conflicto/no disponible y nunca un QR aparentemente válido.

ETag es hash de canonical payload + renderer version; content type y cache policy son explícitos.
No acepta campos fiscales del cliente. Authorization y redacción aplican a payload accesible; SVG
se genera sin scripts ni referencias externas.

La API expone `GET /invoices/{invoiceId}/fiscal-qr` con negociación de representación o subrutas
equivalentes para `payload`, `svg` y `png`. `404` oculta invoices fuera de scope, `409` aplica a
estados sin QR disponible y `422` cubre inconsistencias normativas o renderer version no resoluble.
El recurso es derivado: no existe mutación directa ni override manual del payload.

El detalle devuelto incluye `invoiceId`, `formatVersion`, `rendererVersion`, `etag`, `contentType`,
`generatedAt` y la representación solicitada. Cuando el actor no posee permiso para ver payload
completo, la API puede limitarse a la imagen final o a metadatos mínimos, siempre preservando
determinismo y sin revelar datos adicionales respecto de la invoice autorizada.

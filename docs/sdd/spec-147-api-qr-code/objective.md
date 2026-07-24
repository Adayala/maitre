# Objetivo — SPEC-147

Definir la API de consulta y render del QR fiscal como proyección determinística y segura de una
invoice ya autorizada.

## Criterios de aceptación

### CAD-147-01 — La API sólo expone QR para invoices `AUTHORIZED`

la API sólo expone QR para invoices `AUTHORIZED`; `DRAFT`, `VALIDATED`, `REJECTED` o
`PENDING_RECONCILIATION` no devuelven un QR aparentemente válido.

### CAD-147-02 — Payload y render del QR se derivan sólo server-side desde SPEC-141

payload, SVG o raster se derivan server-side desde SPEC-141 y nunca aceptan campos
fiscales aportados por el cliente.

### CAD-147-03 — `ETag`, content type, cache y hash aseguran reproducibilidad

`ETag`, content type, cache policy y hash se basan en canonical payload y renderer version
para asegurar reproducibilidad.

### CAD-147-04 — Authorization y redaction controlan representaciones sin exponer PII

authorization y redaction controlan qué representación puede obtener cada actor sin
exponer PII ni secretos.

### CAD-147-05 — SVG y demás salidas no contienen comportamiento activo

SVG y otros formatos de salida no contienen scripts, referencias externas ni
comportamiento activo.

### CAD-147-06 — La aprobación exige evidencia de estados inválidos, cache y render reproducible

La aprobación exige fixtures de estados inválidos, determinismo, cache, redaction,
encoding y compatibilidad de render.

# Verificación — SPEC-147

## Criterios

### CAD-147-01 — La API sólo expone QR para invoices `AUTHORIZED`

- [ ] sólo invoices `AUTHORIZED` exponen QR fiscal utilizable.

### CAD-147-02 — Payload y render del QR se derivan sólo server-side desde SPEC-141

- [ ] el QR se deriva sólo server-side sin campos fiscales del cliente.

### CAD-147-03 — `ETag`, content type, cache y hash aseguran reproducibilidad

- [ ] `ETag`, hash y cache policy son determinísticos por payload y renderer version.

### CAD-147-04 — Authorization y redaction controlan representaciones sin exponer PII

- [ ] authorization y redaction limitan representaciones según permiso.

### CAD-147-05 — SVG y demás salidas no contienen comportamiento activo

- [ ] salidas SVG/raster no contienen scripts ni referencias externas.

### CAD-147-06 — La aprobación exige evidencia de estados inválidos, cache y render reproducible

- [ ] fixtures cubren estados inválidos, cache, encoding y render reproducible.

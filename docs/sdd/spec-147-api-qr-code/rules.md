# Reglas — SPEC-147

- Sólo invoices `AUTHORIZED` pueden resolver QR fiscal.
- Cliente nunca envía payload fiscal autoritativo.
- Hash, `ETag` y cache derivan del payload canónico y renderer version.
- Authorization y redaction aplican por representación.
- SVG/raster no pueden incluir scripts ni referencias externas.

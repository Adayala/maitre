# Verificación — SPEC-146

## Criterios

### CAD-146-01 — La API expone lifecycle y permisos explícitos para fiscal printers

- [ ] recursos y comandos cubren lifecycle y permisos explícitos.

### CAD-146-02 — Ningún endpoint recibe ni devuelve secretos; usa sólo secret refs

- [ ] configuración sensible usa sólo secret refs sin exponer secretos.

### CAD-146-03 — `test` usa capacidades allowlisted y nunca emite comprobantes reales

- [ ] `test` opera con límites seguros y nunca emite comprobantes reales.

### CAD-146-04 — `retire` exige cero jobs pendientes o migración explícita

- [ ] `retire` exige cola vacía o migración explícita.

### CAD-146-05 — Errores de proveedor no alteran invoices, autorizaciones ni numeración

- [ ] errores de proveedor no mutan invoices ni numeración fiscal.

### CAD-146-06 — La aprobación exige evidencia de lifecycle, retire seguro y degradación

- [ ] fixtures cubren lifecycle, timeouts, retire, redacción y degradación.

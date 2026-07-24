# Objetivo — SPEC-146

Definir la API de alta, configuración controlada y retiro de fiscal printers como capacidad
periférica, sin mezclarla con la autoridad principal de emisión fiscal electrónica.

## Criterios de aceptación

### CAD-146-01 — La API expone ciclo de vida y permisos explícitos para fiscal printers

la API expone register/list/configure-by-secret-reference/activate/test/retire con
ciclo de vida y permisos explícitos.

### CAD-146-02 — Ningún endpoint recibe ni devuelve secretos; usa sólo secret refs

ningún endpoint recibe ni devuelve secretos; la configuración sensible se referencia
mediante secret refs aprobadas.

### CAD-146-03 — `test` usa capacidades allowlisted y nunca emite comprobantes reales

`test` usa sólo capacidades allowlisted, timeouts y límites seguros, y nunca emite
comprobantes fiscales reales.

### CAD-146-04 — `retire` exige cero jobs pendientes o migración explícita

`retire` exige cero jobs pendientes o una migración explícita de cola/dispositivo.

### CAD-146-05 — Errores de proveedor no alteran invoices, autorizaciones ni numeración

errores del proveedor/dispositivo se normalizan y nunca alteran invoices, autorizaciones
ni numeración fiscal ya asignada.

### CAD-146-06 — La aprobación exige evidencia de ciclo de vida, retire seguro y degradación

La aprobación exige fixtures de ciclo de vida, permisos, timeouts, retire seguro, redacción y
degradación cuando no existe printer habilitada.

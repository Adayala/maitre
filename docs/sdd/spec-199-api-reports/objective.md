# Objetivo — SPEC-199

Definir la API de reports como job versionado, auditable y seguro para generación/descarga.

## Criterios de aceptación

### CAD-199-01 — El job queda versionado por período, scope, timezone, formato y definición

El job queda versionado por period/branch/timezone/format/report definition.

### CAD-199-02 — El manifest conserva params, revisiones, freshness, suppression, hash y errores

El manifest conserva params, metric/data revisions, freshness, suppression, counts, hash, errors y
generatedAt.

### CAD-199-03 — Límites de rango, filas, costo y retención son obligatorios

Range, row, cost y retention limits son obligatorios.

### CAD-199-04 — La descarga firmada expira, se audita y CSV neutraliza formula injection

Signed download expira y se audita; CSV neutraliza formula injection.

### CAD-199-05 — El retry idempotente no duplica artifacts y permisos se reaplican

Reintento idempotente no duplica artifacts y el report respeta permisos tanto al generar como al
descargar.

### CAD-199-06 — La aprobación exige evidencia de manifest, expiración, inyección, retry y permisos

La aprobación exige fixtures de manifest versionado, expiración, formula injection, retry idempotente,
límites y enforcement de permisos.

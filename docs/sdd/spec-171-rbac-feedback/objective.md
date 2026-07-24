# Objetivo — SPEC-171

Definir el modelo RBAC del dominio feedback/reputación con deny-by-default, separación de contenido,
PII, análisis y conectores.

## Criterios de aceptación

### CAD-171-01 — Permisos quedan separados por submit, caso, contenido, PII, análisis y conectores

permisos quedan separados entre `feedback.submit`, `case.read/manage`, `content.read`,
`pii.read`, `redact`, `export`, `reputation.aggregate.read`, `sentiment.run`,
`sentiment.model.manage` y `review_connector.manage`.

### CAD-171-02 — `GUEST` usa sólo capability pública y no existen roles locales implícitos

`GUEST` sólo usa capability de submit; `customer`, `staff` y `reputation analyst` no se
modelan como roles locales predefinidos del dominio.

### CAD-171-03 — Assignments operativos respetan sucursal y propósito sin acceso global

assignments operativos se otorgan por sucursal/propósito y no implican acceso global.

### CAD-171-04 — Texto y PII se deniegan por default; export exige step-up y auditoría

texto y PII se deniegan por default; export exige step-up y auditoría.

### CAD-171-05 — Administrar modelos o conectores no implica leer contenido o PII

administrar modelos o conectores no implica leer contenido o PII.

### CAD-171-06 — La aprobación exige evidencia de deny-by-default, alcances y separación de privilegios

La aprobación exige fixtures de deny-by-default, alcance por sucursal/propósito, step-up export,
separación admin-vs-content y capabilities públicas.

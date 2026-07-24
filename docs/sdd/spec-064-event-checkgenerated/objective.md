# Objetivo — SPEC-064

Publicar apertura, ajuste y settlement de Check como hechos separados, sin conservar
CheckGenerated ni implicar factura fiscal.

## Criterios de aceptación

### CAD-064-01 — El registry admite sólo los eventos aprobados de billing check

El registry admite sólo opened, adjusted y settled bajo namespace billing.

### CAD-064-02 — Cada evento conserva trigger, partition y revisión exactos

Cada evento tiene trigger, aggregate/partition Check, timestamp y revisión exactos.

### CAD-064-03 — Los schemas monetarios exponen sólo el detalle necesario

totales e importe de ajuste respetan MoneyPolicy y cada schema expone sólo los campos
necesarios.

### CAD-064-04 — CheckSettled se publica sólo con liquidación comercial completa

settled se publica únicamente con Check SETTLED, balance cero y Payments no ambiguos.

### CAD-064-05 — Los eventos de Check no implican autoridad fiscal ni datos sensibles

Ningún evento implica Invoice, autoridad fiscal, PII, productos ni Payment details;
consumidores revalidan cualquier acción.

### CAD-064-06 — La aprobación exige evidencia monetaria, de compatibilidad y aislamiento

La aprobación exige fixtures de redondeo, ajustes concurrentes, retry, reorder,
compatibilidad, redacción y aislamiento.

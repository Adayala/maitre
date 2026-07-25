# Objetivo — SPEC-090

Definir la API pública de DigitalBill como lectura versionada del Check con privacy, freshness y
capability separada.

## Criterios de aceptación

### CAD-090-01 — La API pública de bill fija capability, revision y `asOf`

endpoint, capability `BILL_READ` y payload permitido quedan definidos con `checkRevision` y
`asOf`, junto con `lastConfirmedAt` y metadata de freshness.

### CAD-090-02 — Los errores de token siguen contrato uniforme y anti-enumeración

token inválido, vencido o revocado usa contrato uniforme y anti-enumeración.

### CAD-090-03 — El payload redacta PII y referencias sensibles sin perder utilidad

payload redacta PII, instrumentos y referencias sensibles sin perder utilidad comercial.

### CAD-090-04 — Freshness, cache-control y reemplazo por revisión son inequívocos

freshness, cache-control y reemplazo por nueva revisión son inequívocos, declarando el modo
`LIVE_SNAPSHOT` del I0.

### CAD-090-05 — La API no concede mutaciones ni sustituye otras autoridades

la API no concede mutaciones ni sustituye invoice/payment authorities.

### CAD-090-06 — La aprobación exige evidencia de expiry, pagos concurrentes y cache

La aprobación exige fixtures de metadata temporal, aislamiento y token inválido; expiry,
revocación expuesta y pagos concurrentes completos pueden endurecerse después.

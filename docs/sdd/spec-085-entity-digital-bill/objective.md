# Objetivo — SPEC-085

Definir DigitalBill como proyección pública versionada de Check con redacción, revisión y
capability separada.

## Criterios de aceptación

### CAD-085-01 — DigitalBill se define como proyección versionada de Check

DigitalBill queda definido como proyección de Check con `checkRevision`, `asOf` y lifecycle
público inequívoco.

### CAD-085-02 — La capability pública de bill es opaca y separada de otros canales

token/capability pública usa opacidad, hashing, expiry y revocación separados de otros
canales.

### CAD-085-03 — El payload público excluye PII e instrumentos sensibles

payload permitido, redacciones y límites de privacidad excluyen PII e instrumentos
sensibles.

### CAD-085-04 — Revisión, cache y consistencia temporal quedan especificadas

reemplazo por nueva revisión, cache-control y consistencia temporal quedan especificados.

### CAD-085-05 — DigitalBill no sustituye autoridad fiscal ni concede mutaciones

DigitalBill no reemplaza Invoice fiscal ni concede mutaciones o permisos adicionales.

### CAD-085-06 — La aprobación exige evidencia de expiry, revocación y cache

La aprobación exige fixtures de expiry, revocación, settled/void, replay, cache y no
enumeración.

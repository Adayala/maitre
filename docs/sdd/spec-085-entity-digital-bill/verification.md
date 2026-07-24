# Verificación — SPEC-085

## Criterios

### CAD-085-01 — DigitalBill se define como proyección versionada de Check

- [ ] revisión, `asOf` y estados públicos derivan consistentemente desde Check.

### CAD-085-02 — La capability pública de bill es opaca y separada de otros canales

- [ ] capability BILL_READ usa hashing, expiry y revocación separadas.

### CAD-085-03 — El payload público excluye PII e instrumentos sensibles

- [ ] payload redacciona PII, payment details y referencias internas.

### CAD-085-04 — Revisión, cache y consistencia temporal quedan especificadas

- [ ] revisiones, cache y consistencia temporal no mezclan estados.

### CAD-085-05 — DigitalBill no sustituye autoridad fiscal ni concede mutaciones

- [ ] DigitalBill no sustituye Invoice ni habilita mutaciones.

### CAD-085-06 — La aprobación exige evidencia de expiry, revocación y cache

- [ ] fixtures cubren expiry, revocación, settled/void, replay y aislamiento.

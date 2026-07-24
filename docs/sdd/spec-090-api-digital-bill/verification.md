# Verificación — SPEC-090

## Criterios

### CAD-090-01 — La API pública de bill fija capability, revision y `asOf`

- [ ] endpoint y payload público exponen `checkRevision`/`asOf` de forma estable.

### CAD-090-02 — Los errores de token siguen contrato uniforme y anti-enumeración

- [ ] capability inválida/vencida/revocada no enumera existencia ni alcance.

### CAD-090-03 — El payload redacta PII y referencias sensibles sin perder utilidad

- [ ] redactions excluyen PII, payment instruments y referencias internas.

### CAD-090-04 — Freshness, cache-control y reemplazo por revisión son inequívocos

- [ ] cache/freshness y revisiones no mezclan estados de Check.

### CAD-090-05 — La API no concede mutaciones ni sustituye otras autoridades

- [ ] la API no habilita mutaciones ni sustituye Invoice/Payment.

### CAD-090-06 — La aprobación exige evidencia de expiry, pagos concurrentes y cache

- [ ] fixtures cubren pagos concurrentes, expiry, revocación y aislamiento entre tenants.

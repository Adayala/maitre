# Verificación — SPEC-067

## Criterios

### CAD-067-01 — Guest minimiza atributos y declara metadata de tratamiento por campo

- [ ] minimización y metadata de tratamiento validan por campo/purpose.

### CAD-067-02 — Los ContactPoints son opcionales, normalizados y no deduplican por nombre

- [ ] normalización, verificación y lookup no permiten enumeración.

### CAD-067-03 — Merge converge con auditoría y máxima restricción de privacidad

- [ ] merges concurrentes convergen sin perder aliases ni restricciones.

### CAD-067-04 — Unmerge no revive PII borrada ni consentimiento revocado

- [ ] unmerge respeta borrado, revocación y retention vigentes.

### CAD-067-05 — Historial y workflows sensibles permanecen separados del perfil Guest

- [ ] export/anonymize y proyecciones históricas preservan sus fronteras.

### CAD-067-06 — La aprobación exige evidencia de duplicados, privacidad y aislamiento

- [ ] opt-out, redacción, auditoría y cross-tenant poseen evidencia.

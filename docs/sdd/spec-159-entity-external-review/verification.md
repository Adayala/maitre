# Verificación — SPEC-159

## Criterios

### CAD-159-01 — ExternalReview se identifica idempotentemente por plataforma, external ID y scope

- [ ] identidad idempotente por plataforma/external ID/scope queda definida.

### CAD-159-02 — La entidad conserva metadata completa de origen y versionado

- [ ] metadata de origen, rating, URL, timestamps y hashes se conserva completa.

### CAD-159-03 — Texto y autor se almacenan sólo si ToS y base lo permiten

- [ ] texto/autor respetan ToS, base de tratamiento y redacción.

### CAD-159-04 — Ediciones remotas crean nuevas versiones y deletes remotos tombstonean

- [ ] ediciones crean nuevas versiones y deletes remotos tombstonean localmente.

### CAD-159-05 — Provenance y attribution se preservan y freshness gobierna vigencia

- [ ] provenance/attribution se preservan y freshness gobierna visibilidad vigente.

### CAD-159-06 — La aprobación exige evidencia de upsert, tombstone, freshness y ToS

- [ ] fixtures cubren upsert, cambios remotos, tombstone, ToS y freshness.

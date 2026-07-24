# Verificación — SPEC-072

## Criterios

### CAD-072-01 — La API de Guest separa perfil, contacto y consentimiento minimizados

- [ ] OpenAPI y schemas separan perfil, contacto y consent.

### CAD-072-02 — La búsqueda exacta de contacto evita enumeración y exige permiso PII

- [ ] lookup exacto no enumera y aplica normalización/redacción.

### CAD-072-03 — Mutaciones y consent preservan revisión y evidencia append-only

- [ ] revisions y consent append-only impiden pérdida/ampliación de tratamiento.

### CAD-072-04 — Merge y unmerge convergen preservando restricciones y snapshots

- [ ] merge/unmerge concurrentes convergen sin restaurar PII.

### CAD-072-05 — Export y anonymize son workflows asíncronos con retención legal

- [ ] export/anonymize preservan referencias, expiry y retención legal.

### CAD-072-06 — La aprobación exige evidencia de redacción, opt-out y aislamiento

- [ ] permissions, step-up, auditoría, logs y aislamiento fallan cerrado.

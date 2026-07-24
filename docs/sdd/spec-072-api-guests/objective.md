# Objetivo — SPEC-072

Definir acceso y gestión segura de Guest, incluyendo PII, consentimiento, merge, exportación y
anonimización sin romper referencias históricas.

## Criterios de aceptación

### CAD-072-01 — La API de Guest separa perfil, contacto y consentimiento minimizados

profile, ContactPoint y consent usan rutas/schemas/permissions separados y minimizados.

### CAD-072-02 — La búsqueda exacta de contacto evita enumeración y exige permiso PII

búsqueda exacta normaliza contacto, exige permiso PII y no permite enumeración
cross-tenant.

### CAD-072-03 — Mutaciones y consent preservan revisión y evidencia append-only

PATCH y ContactPoint mutations exigen revisión; consent es evidencia append-only por
purpose/channel.

### CAD-072-04 — Merge y unmerge convergen preservando restricciones y snapshots

merge/unmerge son idempotentes, concurrentes y preservan aliases, restricciones y
snapshots.

### CAD-072-05 — Export y anonymize son workflows asíncronos con retención legal

export/anonymize son workflows asíncronos, step-up, auditados, expirables y respetan
retention/legal hold.

### CAD-072-06 — La aprobación exige evidencia de redacción, opt-out y aislamiento

La aprobación exige fixtures de redacción, opt-out, carreras, self-service, no enumeración
y aislamiento.

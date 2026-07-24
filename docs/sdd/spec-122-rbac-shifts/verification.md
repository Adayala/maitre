# Verificación — SPEC-122

## Criterios

### CAD-122-01 — Cada operación de shifts mapea a permissions canónicas exactas

- [ ] SPEC-115–121 mapean 1:1 a permissions canónicas aprobadas.

### CAD-122-02 — La autorización combina tenant, branch, Employment, ownership y sensibilidad

- [ ] tenant, branch, Employment y ownership producen matriz estable.

### CAD-122-03 — `employee`, `supervisor` y `payroll` son assignments, no roles implícitos

- [ ] perfiles/assignments no actúan como roles locales implícitos.

### CAD-122-04 — Requester y approver permanecen segregados cuando la policy lo exige

- [ ] requester y approver segregados bloquean self-approval cuando corresponde.

### CAD-122-05 — Export y sensitive read requieren controles adicionales y auditoría

- [ ] export y sensitive read requieren step-up/audit y scopes válidos.

### CAD-122-06 — La aprobación exige evidencia de allow/deny, self-approval y sensibilidad

- [ ] fixtures cubren revocación, stale auth, self-approval y aislamiento.

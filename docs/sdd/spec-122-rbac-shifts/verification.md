# Verificación — SPEC-122

Estado actual: assessment parcial. Ya existe una primera materialización de permisos canónicos para
`workshift.plan`, `workshift.assign`, `workshift.read_own`, `time.clock`,
`time.adjust.request`, `time.adjust.approve`, `time.read_own` y `time.read_sensitive`.

Migrado a canónico:

- mutaciones de `work-shifts` → `workshift.plan`
- mutaciones de `shift-assignments` → `workshift.assign`
- lecturas supervisoras de `work-shifts` / `shift-assignments` → `workshift.plan|assign`
- `clock-in` / `clock-out` → `time.clock`
- request / approve / reject de ajustes → `time.adjust.request|approve`
- lecturas sensibles branch-scoped de `time-entries` y `workforce-summary` → `time.read_sensitive`

Pendiente de materialización:

- reemplazo definitivo de legacy `workforce:read/manage` en superficies no cubiertas aún por permiso
  canónico explícito de SPEC-122

## Criterios

### CAD-122-01 — Cada operación de shifts mapea a permissions canónicas exactas

- [~] SPEC-115–121 mapean 1:1 a permissions canónicas aprobadas; la matriz de `employments` quedó
  cerrada en spec y falta terminar su materialización completa.

### CAD-122-02 — La autorización combina tenant, branch, Employment, ownership y sensibilidad

- [~] tenant, branch, Employment y ownership ya tienen matriz cerrada en spec; falta completar
  materialización y evidencia integral en código/tests.

### CAD-122-03 — `employee`, `supervisor` y `payroll` son assignments, no roles implícitos

- [~] perfiles/assignments no actúan como roles locales implícitos; la frontera de `payroll` quedó
  cerrada en spec y falta completar materialización/pruebas explícitas.

### CAD-122-04 — Requester y approver permanecen segregados cuando la policy lo exige

- [~] requester y approver segregados ya están definidos en spec y cubiertos en parte por
  materialización/tests; falta cierre integral de evidencia.

### CAD-122-05 — Export y sensitive read requieren controles adicionales y auditoría

- [~] sensitive read ya exige scope válido; la spec ya cerró export/step-up/audit y falta terminar su
  materialización/evidencia en código.

### CAD-122-06 — La aprobación exige evidencia de allow/deny, self-approval y sensibilidad

- [~] fixtures ya cubren allow/deny, stale auth temporal en sesiones fixture y aislamiento principal;
  la spec ya cerró revocación/step-up y falta completar fixtures/materialización explícita.

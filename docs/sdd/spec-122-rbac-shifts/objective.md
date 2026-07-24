# Objetivo — SPEC-122

Definir permisos canónicos, alcances y segregación de funciones para WorkShifts, TimeTracking,
adjustments y exports laborales.

## Criterios de aceptación

### CAD-122-01 — Cada operación de shifts mapea a permisos canónicos exactos

cada operación de SPEC-115–121 mapea a permisos canónicos exactos, sin wildcard.

### CAD-122-02 — La autorización combina tenant, sucursal, Employment, ownership y sensibilidad

autorización combina tenant, sucursal, Employment, ownership y datos sensibles según la
acción.

### CAD-122-03 — `employee`, `supervisor` y `payroll` son assignments, no roles implícitos

`employee`, `supervisor` y `payroll` son assignments/perfiles de permisos, no roles locales
implícitos.

### CAD-122-04 — Requester y approver permanecen segregados cuando la policy lo exige

requester y approver de ajustes permanecen segregados cuando la policy lo exige.

### CAD-122-05 — Export y sensitive read requieren controles adicionales y auditoría

export y lectura sensible requieren controles adicionales, step-up y auditoría.

### CAD-122-06 — La aprobación exige evidencia de allow/deny, self-approval y sensibilidad

La aprobación exige matrices allow/deny, revocación, autorización desactualizada, self-approval, data
sensitivity y aislamiento.

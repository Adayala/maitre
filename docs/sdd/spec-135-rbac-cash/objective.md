# Objetivo — SPEC-135

Definir permisos canónicos, scopes y segregación de funciones para sesiones de caja, movimientos,
reconciliaciones, descuentos y exportes sensibles.

## Criterios de aceptación

### CAD-135-01 — Cada operación cash mapea a permissions canónicas exactas

cada operación de SPEC-128–134 mapea a permissions canónicas exactas, sin wildcard.

### CAD-135-02 — La autorización combina tenant, branch, ownership, limits policy y scopes sensibles

autorización combina tenant, branch, session ownership, limits policy y scopes sensibles
según la acción.

### CAD-135-03 — CASHIER, MANAGER y assignments de finance/supervisor no son roles implícitos

CASHIER, MANAGER y assignments de `finance`/`supervisor` no se comportan como roles
locales implícitos.

### CAD-135-04 — Self-approval, overrides y compensaciones riesgosas quedan segregadas

autoaprobación de diferencias, overrides y compensaciones riesgosas quedan segregadas
cuando la policy lo exige.

### CAD-135-05 — Exportes y thresholds requieren step-up, approver distinto y auditoría

exportes y operaciones sobre threshold requieren step-up, approver distinto y auditoría.

### CAD-135-06 — La aprobación exige evidencia de allow/deny, self-approval y thresholds

La aprobación exige matrices allow/deny, revocación, stale auth, self-approval, threshold
overrides y aislamiento.

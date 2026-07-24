# Verificación — SPEC-116

## Criterios

### CAD-116-01 — La API de ShiftAssignments define endpoints y ciclo de vida con claridad

- [ ] la superficie create/list/confirm/decline/reassign/cancel es inequívoca.

### CAD-116-02 — Toda mutación usa idempotencia, revisión y revalidación transaccional

- [ ] idempotencia, `If-Match` y revalidación transaccional cubren conflictos.

### CAD-116-03 — Reassign conserva atomicidad entre cancelación previa y nueva asignación

- [ ] `reassign` evita estados intermedios visibles.

### CAD-116-04 — Self-service y management aplican permisos y minimización de datos distintos

- [ ] self-service y management aplican alcances y redacciones distintas.

### CAD-116-05 — Notificaciones son side effects por outbox y no gobiernan la transacción

- [ ] notificaciones son side effects de outbox y no cambian el resultado transaccional.

### CAD-116-06 — La aprobación exige evidencia de conflictos, empleado inactivo y RBAC

- [ ] fixtures cubren shift cancelado, empleado inactivo, rol y cross-scope.

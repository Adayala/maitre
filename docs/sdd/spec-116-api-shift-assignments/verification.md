# Verificación — SPEC-116

## Criterios

### CAD-116-01 — La API de ShiftAssignments define endpoints y ciclo de vida con claridad

- [x] la superficie create/list/detail/confirm/decline/reassign/cancel es inequívoca y está
  respaldada por fixtures de ciclo de vida, filtros y errores.

### CAD-116-02 — Toda mutación usa idempotencia, revisión y revalidación transaccional

- [x] `confirm`/`decline`/`cancel`/`reassign` exigen `If-Match` válido y fallan con revisión
  stale sin mutar la asignación previa.
- [x] `create`/`confirm`/`decline`/`cancel`/`reassign` soportan replay por `Idempotency-Key`
  sin duplicar ni volver a mutar assignments.

### CAD-116-03 — Reassign conserva atomicidad entre cancelación previa y nueva asignación

- [x] `reassign` valida target antes de cancelar la asignación previa y evita estados intermedios
  visibles cuando la nueva asignación falla.

### CAD-116-04 — Self-service y management aplican permisos y minimización de datos distintos

- [x] self-service puede leer únicamente assignments propios (`GET /work-shifts/:id/assignments`
  filtrado y `GET /shift-assignments/:id` propio), mientras management conserva lectura completa
  por sucursal/turno con permisos sensibles.

### CAD-116-05 — Notificaciones son side effects por outbox y no gobiernan la transacción

- [x] `create`/`confirm`/`cancel` emiten eventos por outbox; `reassign` emite cancelación +
  creación sin condicionar el resultado transaccional del comando.

### CAD-116-06 — La aprobación exige evidencia de conflictos, empleado inactivo y RBAC

- [x] fixtures cubren shift cancelado, empleado inactivo/ineligible, rol/reassign y RBAC
  cross-scope.

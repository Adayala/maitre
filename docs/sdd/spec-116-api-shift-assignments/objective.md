# Objetivo — SPEC-116

Definir la API de ShiftAssignments para crear, confirmar, declinar, reasignar y cancelar vínculos
laborales versionados con minimización de datos personales.

## Criterios de aceptación

### CAD-116-01 — La API de ShiftAssignments define endpoints y ciclo de vida con claridad

endpoints create/list y comandos de ciclo de vida quedan definidos con claridad.

### CAD-116-02 — Toda mutación usa idempotencia, revisión y revalidación transaccional

toda mutación usa idempotencia, `If-Match` y revalidación transaccional de Employment,
elegibilidad por sucursal, rol y conflictos.

### CAD-116-03 — Reassign conserva atomicidad entre cancelación previa y nueva asignación

`reassign` conserva atomicidad entre cancelación previa y nueva asignación.

### CAD-116-04 — Self-service y management aplican permisos y minimización de datos distintos

self-service y management usan permisos distintos y las respuestas minimizan datos personales.

### CAD-116-05 — Notificaciones son side effects por outbox y no gobiernan la transacción

notificaciones son side effects por outbox y no condicionan el resultado transaccional.

### CAD-116-06 — La aprobación exige evidencia de conflictos, empleado inactivo y RBAC

La aprobación exige fixtures de conflicto concurrente, shift cancelado, empleado inactivo,
cambios de rol, RBAC y aislamiento.

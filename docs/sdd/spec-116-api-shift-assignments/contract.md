# Contrato API — SPEC-116 Shift Assignments

Crear, listar y ejecutar confirm/decline/reassign/cancel sobre asignaciones de turno. Cada
comando es idempotente, usa If-Match y revalida disponibilidad, pertenencia y política laboral
en la misma transacción. Las respuestas minimizan datos personales y separan acceso propio de
gestión. Tests cubren conflictos concurrentes, turno cancelado, empleado inactivo, cambios de
rol, paginación, RBAC, notificación y aislamiento entre tenants.

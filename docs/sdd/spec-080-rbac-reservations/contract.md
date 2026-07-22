# Contrato RBAC — SPEC-080

MAITRE/MANAGER gestionan reservas y waitlist dentro de branch scope; cualquier otro rol opera sólo
mediante permisos canónicos explícitos, sin introducir un rol local `host`. WAITER lee únicamente
contexto operativo necesario. El canal público crea/consulta mediante capability opaca limitada,
nunca Membership. Guest PII requiere permiso separado. Tests cubren matriz, public token,
cross-branch, bulk export denial, self-escalation y auditoría.

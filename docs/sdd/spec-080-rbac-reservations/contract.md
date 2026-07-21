# Contrato RBAC — SPEC-080

MAITRE/MANAGER gestionan reservas y waitlist dentro de branch scope; host/rol designado
puede crear, confirmar, notificar, seat y cancelar según permisos; WAITER lee sólo contexto
operativo necesario; canal público crea/consulta mediante capability opaca limitada, nunca
membership. Guest PII requiere permiso separado. Tests cubren matriz, public token,
cross-branch, bulk export denial, self-escalation y auditoría.

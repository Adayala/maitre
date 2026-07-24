# Contrato RBAC — SPEC-080

MAITRE/MANAGER pueden recibir assignments para reservas y waitlist dentro de alcance por sucursal;
cualquier rol opera sólo mediante permisos canónicos explícitos, sin introducir un rol
local `host`. WAITER lee únicamente
contexto operativo necesario. El canal público crea/consulta mediante capability opaca limitada,
nunca Membership. Guest PII requiere permiso separado. Tests cubren matriz, public token,
aislamiento entre sucursales, bulk export denial, self-escalation y auditoría.

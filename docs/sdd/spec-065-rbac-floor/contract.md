# Contrato RBAC — SPEC-065

MAITRE administra seating/moves y ve Floor completo por branch scope; WAITER opera Visits y
mesas asignadas/permitidas; MANAGER supervisa/corrige con permisos explícitos; CASHIER lee
Check/Payment necesarios sin gestionar seating; COOK no accede a guest/check salvo contrato.

Abrir/cerrar Visit, mover mesa, void Check y registrar Payment son acciones distintas.
Toda mutación valida Membership/branch scope y reglas de dominio, con auditoría. Tests cubren
matriz, assignment, cross-branch, self-escalation y no enumeración.

# Contrato RBAC — SPEC-065

MAITRE administra seating/moves y ve Floor dentro de su alcance por sucursal; WAITER opera sólo
Visits/mesas asignadas o permitidas; MANAGER supervisa/corrige únicamente con permisos
explícitas; CASHIER accede al mínimo de Check/Payment sin gestionar seating; COOK no recibe
acceso Floor/Guest/Check por su rol nominal.

Abrir/cerrar Visit, mover mesa, void Check y registrar Payment son acciones distintas.
OWNER/ADMIN tampoco implican wildcard ni bypass. Toda decisión valida Membership ACTIVE,
permiso, alcance de Branch/assignment, revisión de autorización y reglas de dominio. Reopen,
void, refund/approval y force-close agregan step-up, reason y segregación según política.
Tests cubren matriz, assignment, límites, cross-Branch, self-escalation y no enumeración.

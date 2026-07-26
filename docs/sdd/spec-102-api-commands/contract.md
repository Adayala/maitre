# Contrato API — SPEC-102 Commands

Obtener y ejecutar transiciones explícitas sobre comandas de cocina, más listar Commands por Order
para el flujo operativo. El contexto deriva tenant y permisos desde auth. I0 no implementa
`If-Match` ni idempotencia por header; usa la state machine del agregado para aceptar o rechazar
transiciones. El surface actual incluye `claim`, `release`, `start`, `hold`, `resume`,
`mark-ready`, `complete-handoff`, `rollback`, `cancel`, `transfer` y `reprioritize`. Tests cubren
estados terminales, lifecycle, reasignación, prioridades, RBAC y aislamiento entre tenants.

# Especificación — SPEC-086 KitchenTicket

KitchenTicket es un agregado autoritativo de despacho a producción, creado al submit por cada
Order revision + station. No es el read model KDS y no duplica el estado comercial de Order.

Contiene TicketLine referenciando OrderItem allocations, station/routing policy version,
prioridad, timestamps y snapshots culinarios mínimos; omite precios y PII. Acepta comandos
`start-line`, `mark-ready`, `complete-handoff`, `cancel-line` y `reprioritize`, todos idempotentes y
con expected revision. El ticket deriva su estado de TicketLine según SPEC-110.

El KDS es una proyección reconstruible desde KitchenTicket/events. Replay y eventos fuera de orden
convergen por aggregate revision; no retroceden líneas terminales. Cambiar station crea una
transferencia auditada, no ownership simultáneo.

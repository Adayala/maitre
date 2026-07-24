# Especificación — SPEC-086

`KitchenTicket` es un agregado autoritativo de despacho a producción, creado al submit por cada
revisión de `Order` + `station`. No es el read model KDS y no duplica el estado comercial de `Order`.

Contiene `TicketLine` referenciando allocations de `OrderItem`, versión de station/routing policy,
prioridad, timestamps y snapshots culinarios mínimos; omite precios y PII. Acepta comandos
`start-line`, `mark-ready`, `complete-handoff`, `cancel-line` y `reprioritize`, todos idempotentes y
con expected revision. El ticket deriva su estado de `TicketLine` según SPEC-110.

El KDS es una proyección reconstruible desde `KitchenTicket`/eventos. Replay y eventos fuera de orden
convergen por revisión agregada; no retroceden líneas terminales. Cambiar station crea una
transferencia auditada, no ownership simultáneo.

Cada `KitchenTicket` hereda `tenantId`, `brandId`, `branchId`, `visitId`, `orderId` y agrega
`stationId`, `routingPolicyRevisionId` y `ticketId`. La identidad lógica de idempotencia para
creación se basa en `orderId + orderRevision + stationId`, de modo que reintentos no duplican
trabajo ni líneas.

`TicketLine` referencia allocations o unidades productivas de `OrderItem` y conserva sólo snapshots
culinarios mínimos: nombre publicable, quantity operativa, modifier summary tipado, notas
sanitizadas, fire timing, allergen/safety flags necesarios y prioridad operativa. No incluye
precios, descuentos, datos fiscales, guest PII ni metadata comercial no relevante para cocina.

Los comandos permitidos son idempotentes y requieren revisión esperada: `start-line`,
`mark-ready`, `complete-handoff`, `cancel-line` y `reprioritize`. `cancel-line` sólo compensa el
flujo productivo; el impacto comercial sigue gobernado por `Order`/`Check`. Las transiciones exactas de
línea se coordinan con SPEC-110, pero `KitchenTicket` es la autoridad del historial de despacho y
handoff por station.

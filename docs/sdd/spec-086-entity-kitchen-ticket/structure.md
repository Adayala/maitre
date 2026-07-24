# Estructura — SPEC-086

```text
KitchenTicket
├── scope: tenantId, brandId, branchId, visitId, orderId, stationId, ticketId
├── authority: routingPolicyRevisionId, aggregateRevision, ticket status
├── lines: TicketLine[]
│   ├── orderItem allocation reference
│   ├── culinary snapshot mínimo
│   ├── priority/timing
│   └── line status/history
└── audit/outbox/transfer metadata
```

KDS y pantallas operativas son proyecciones reconstruibles; KitchenTicket conserva la autoridad de
despacho por station.

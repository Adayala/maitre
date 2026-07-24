# Estructura — SPEC-106

```text
kitchen.command.received.v1
├── envelope SPEC-217
├── scope: tenantId, brandId, branchId
├── refs: kitchenTicketId, commandId, orderId, orderItemId, allocationId, stationId
├── routing: routingPolicyRevisionId, priorityReason
└── receivedAt + aggregateRevision + correlation
```

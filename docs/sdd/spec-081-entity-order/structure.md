# Estructura — SPEC-081

```text
Order
├── identity: tenantId, brandId, branchId, visitId, orderId
├── authority: status autoritativo, aggregateRevision, submit metadata
├── commercial snapshot: catalogRevisionId, currency, totals, tax treatment
├── items: OrderItem[]
├── adjustments: OrderAdjustment[]
└── audit/outbox references

Estados derivados
├── IN_PREP
├── READY
├── PARTIALLY_DELIVERED
└── DELIVERED
```

Order es la autoridad comercial; KitchenTicket, DigitalBill y tracking son proyecciones o
agregados dependientes, no sustitutos del agregado.

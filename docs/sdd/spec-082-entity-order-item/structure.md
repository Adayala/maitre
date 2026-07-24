# Estructura — SPEC-082

```text
OrderItem
├── scope: tenantId, brandId, branchId, visitId, orderId, orderItemId
├── snapshot: productId, catalogRevisionId, labels, taxes, currency, unit price
├── commercial quantity: ordered, cancelled, delivered
├── modifiers: OrderModifier[]
├── fulfillment: status, allocations, timestamps, expected revision
└── audit links: adjustments, kitchen/check references, actor metadata
```

El snapshot comercial y el lifecycle operativo conviven en el mismo agregado lógico del item; las
proyecciones de cocina o tracking lo consumen, no lo reemplazan.

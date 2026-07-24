# Estructura — SPEC-089

```text
POST /v1/orders/{orderId}/modifications
├── validate permission + scope + expected revision
├── create OrderAdjustment PENDING
├── coordinate saga with KitchenTicket and Check
├── settle APPLIED | REJECTED | COMPENSATION_REQUIRED
└── preserve full audit/correlation trail
```

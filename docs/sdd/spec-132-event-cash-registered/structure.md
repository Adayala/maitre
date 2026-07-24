# Estructura — SPEC-132

```text
cash.cash-movement.recorded.v1
├── envelope SPEC-217
├── scope: tenantId, brandId, branchId
├── refs: registerId, sessionId, movementId
├── economic data: type, direction, amountMinorUnits, currency
└── source identity + occurredAt + ledgerRevision
```

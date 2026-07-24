# Estructura — SPEC-133

```text
cash.cash-session.reconciled.v1
├── envelope SPEC-217
├── scope: tenantId, brandId, branchId
├── refs: registerId, sessionId, reconciliationId
├── monetary summary: expected, counted, difference, currency
└── approvedAt + ledgerRevision + aggregateRevision
```

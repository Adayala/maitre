# Estructura — SPEC-125

```text
CashMovement
├── scope: tenantId, brandId, branchId, cashSessionId, cashMovementId
├── economic fields: amount, currency, direction, type
├── timing: occurredAt, recordedAt
├── traceability: actor, reason, idempotencyKey, sourceReference
└── compensation linkage
```

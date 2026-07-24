# Estructura — SPEC-134

```text
DailySettlementInput
├── tenantId, branchId, businessDate, timezone
├── currency
├── sessions + ledger revisions + cutoffs
├── cash movements
├── reconciliations
└── late adjustments / payment source identities

DailySettlementResult
├── openings + movements by type
├── expected / counted / differences
├── late adjustments
├── inputHash + calculationVersion
└── reason trace / provenance
```

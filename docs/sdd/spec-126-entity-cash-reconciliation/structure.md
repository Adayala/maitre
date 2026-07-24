# Estructura — SPEC-126

```text
CashReconciliation
├── refs: cashSessionId, currency, ledgerRevision
├── counted inputs: denominations/evidence
├── derived: expected, difference
├── lifecycle: DRAFT, SUBMITTED, APPROVED, REJECTED
└── preparer/approver audit metadata
```

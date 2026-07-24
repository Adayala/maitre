# Estructura — SPEC-114

```text
BreakLog
├── ref: timeEntryId
├── classification: breakType, paidClassification, laborPolicyVersion
├── timing: openedAt, closedAt?
├── lifecycle: OPEN, CLOSED
└── append-only BreakAdjustment chain
```

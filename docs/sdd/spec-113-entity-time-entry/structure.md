# Estructura — SPEC-113

```text
TimeEntry
├── scope: tenantId, employmentId, branchId, shiftAssignmentId?
├── timing: capturedAt, receivedAt, timezone, clock skew
├── source: device pseudonymous ID, device sequence, channel
├── lifecycle: OPEN, CLOSED + review flag/workflow
└── append-only adjustments chain
```

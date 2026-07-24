# Estructura — SPEC-119

```text
workforce.work-shift.started.v1
├── envelope SPEC-217
├── scope: tenantId, brandId, branchId, workShiftId
├── planned interval: startsAtUtc, endsAtUtc, timezone
├── startedAt + actorType
└── laborPolicyVersion + aggregateRevision + privacy-safe aggregates
```

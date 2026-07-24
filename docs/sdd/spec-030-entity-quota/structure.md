# Structure — SPEC-030

```text
Quota
├── id, tenantId, code, scope, period
├── used, unit
├── entitlementId
├── sourceRevision
├── reconciliationStatus
└── computedAt/version
```

La estructura física debe soportar admisión atómica y reconciliación; no se presupone un hook ni un
contador eventual como única fuente.

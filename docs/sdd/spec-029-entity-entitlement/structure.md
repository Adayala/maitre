# Structure — SPEC-029

```text
Entitlement
├── id, tenantId, code, scope
├── typed value
├── sourceRefs[]
├── calculationRevision
├── validFrom, validUntil
└── computedAt
```

Override vive como fuente auditada separada. La persistencia física de la proyección se decide
después de aprobar cálculo e invalidación.

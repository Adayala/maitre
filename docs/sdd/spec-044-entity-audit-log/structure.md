# Structure — SPEC-044

```text
AuditPartition (tenant + period)
└── AuditRecord sequence N
    ├── actor/action/resource/outcome/reason
    ├── occurredAt/recordedAt/correlation
    ├── sanitized diff + technical signals
    ├── retention policy ref
    └── previousHash → recordHash
```

La estructura física, partición y retention duration se aprueban con SPEC-219/220. No se fija
cleanup de 90 días sin clasificación legal/operativa.

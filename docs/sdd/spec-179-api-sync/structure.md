# Estructura — SPEC-179

```text
/sync-runs
├── POST start full/incremental
└── /{syncRunId}
    ├── GET detail
    ├── :cancel
    └── :retry
```

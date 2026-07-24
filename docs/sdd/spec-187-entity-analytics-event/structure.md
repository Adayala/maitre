# Estructura — SPEC-187

```text
Analytics Event Model
├── DataRegistry
│   ├── event type / schema / compatibility
│   ├── trusted producers / classification / retention
│   └── lineage / deprecation / backfill policy
└── AnalyticsEvent
    ├── registry ref/version
    ├── tenant / branch / producer / times
    ├── pseudonymous subject
    └── allowlisted properties / quality status
```

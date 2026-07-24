# Estructura — SPEC-104

```text
Production API
├── GET /stations/{stationId}/production
│   └── queue projection + revision/cursor/asOf/freshness
└── operational actions delegated to SPEC-102 Commands API
```

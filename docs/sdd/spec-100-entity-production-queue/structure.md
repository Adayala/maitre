# Estructura — SPEC-100

```text
ProductionQueue
├── scope: tenantId, brandId, branchId, stationId
├── freshness: projectionRevision, projectionCursor, asOf
├── ordered entries: active Commands
│   ├── priority band
│   ├── promisedAt / receivedAt
│   └── stable ID tie-break
└── derived aging/boost metadata
```

ProductionQueue es una proyección reconstruible desde Commands/eventos; no sustituye la autoridad
de Command ni Station.

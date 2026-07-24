# Estructura — SPEC-099

```text
Station
├── scope: tenantId, brandId, branchId, stationId
├── identity: code, displayName, displayOrder
├── capabilities and status
├── RoutingPolicy revisions
│   └── allowlisted rules with priority/specificity
└── audit metadata
```

Station configura producción; ProductionQueue, métricas y alertas consumen esa autoridad, pero no
viven dentro del agregado.

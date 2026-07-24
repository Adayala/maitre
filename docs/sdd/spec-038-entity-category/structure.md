# Structure — SPEC-038

```text
MenuRevision
└── Category
    ├── id, tenantId, name, description
    ├── sortOrder, visibility, version
    └── MenuItem[] (por categoryId)
```

Category es propiedad de MenuRevision. La estructura física y estrategia de reorder se aprueban
después del contrato de publicación.

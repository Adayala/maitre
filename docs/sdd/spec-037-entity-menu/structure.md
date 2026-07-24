# Structure — SPEC-037

```text
Menu
└── MenuRevision
    ├── metadata/currency/scopes/vigencia
    ├── Category[]
    └── MenuItem[] ──references──> Product

Brand + branch scope
└── activeMenuRevisionPointer
```

La persistencia física se decide después de aprobar publicación/pointer y snapshot. Category y
MenuItem son propiedad de la revisión; Product conserva identidad tenant-scoped reutilizable.

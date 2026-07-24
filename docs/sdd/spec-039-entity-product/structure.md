# Structure — SPEC-039

```text
Product (Tenant-scoped)
├── identity/text/editorial status/version
├── tax/dietary/allergen/nutrition declarations
├── modifierSetRefs[]
└── mediaRefs[]

MenuItem[] ──references──> Product
OperationalAvailability ──references──> Product
```

La estructura física se decide después de aprobar assets/declarations/modifiers. No existe FK
obligatoria Product → Category.

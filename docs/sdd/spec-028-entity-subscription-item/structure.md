# Structure — SPEC-028

```text
SubscriptionItem
├── id, subscriptionId
├── serviceCode, catalogVersion
├── status, quantity
├── branchScopes, config
├── validFrom, validUntil
└── version/audit
```

La estructura física se define después del catálogo. No incluye precio como autoridad ni presupone
una tabla `services`.

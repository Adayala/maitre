# Structure — SPEC-027

```text
Subscription
├── id, tenantId
├── status, period
├── catalogVersion
├── version/audit timestamps
└── SubscriptionItem[]
```

La estructura física e índices se aprueban después del modelo lógico. No se presupone tabla de
plans, billing cycle, auto-renew o scheduler.

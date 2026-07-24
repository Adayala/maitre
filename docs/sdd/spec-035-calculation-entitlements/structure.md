# Structure — SPEC-035

Función pura:

```text
calculateEntitlements(snapshot, asOf) -> EntitlementSet | CalculationFailure
```

Triggers candidatos solicitan recomputación al cambiar Subscription, items, catálogo u override.
El trigger no forma parte del resultado y puede duplicarse; el cálculo/reemplazo es idempotente.

Quota/consumo se mantiene fuera de este boundary.

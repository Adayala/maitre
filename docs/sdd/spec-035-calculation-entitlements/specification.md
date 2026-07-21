# Especificación — SPEC-035

## Algoritmo

```
entitlements = {}

1. Load plan defaults
   entitlements["branches"] = plan.max_branches
   entitlements["users"] = plan.max_users
   ...

2. Apply service overrides
   if "floor" in subscription.services:
     entitlements["branches"] = max(entitlements["branches"], 10)
   
   if "kitchen" in subscription.services:
     entitlements["orders"] = unlimited

3. Apply tenant overrides
   if override["branches"] exists and not expired:
     entitlements["branches"] = override["branches"]

4. Persist to entitlements table
```

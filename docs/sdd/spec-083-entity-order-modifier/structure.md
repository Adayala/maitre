# Estructura — SPEC-083

```text
OrderModifier
├── identity: modifierGroupId/code, modifierOptionId/code
├── snapshot labels and quantity semantics
├── commercial delta: net, tax, gross, currency
├── typed kitchen/safety metadata
└── audit linkage through parent OrderItem adjustments
```

Modifier no es un agregado autónomo; vive dentro del snapshot de OrderItem y se gobierna por la
misma revisión comercial.

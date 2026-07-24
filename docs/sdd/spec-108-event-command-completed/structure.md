# Estructura — SPEC-108

```text
kitchen.command.ready.v1
├── envelope SPEC-217
├── command/ticket/order/allocation/station refs
└── readyAt + aggregateRevision + correlation

kitchen.command.completed.v1
├── envelope SPEC-217
├── command/ticket/order/allocation/station refs
└── actorType + completedAt + aggregateRevision + correlation
```

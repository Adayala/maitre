# Objetivo — SPEC-204

Definir Maitre Autopilot como registro de acciones y policy engine, con I0 suggestion-only y sin
ejecución autónoma permitida para acciones riesgosas.

## Criterios de aceptación

### CAD-204-01 — `ActionRegistry` define IDs, tiers, inputs, permisos, adapters, límites y auditoría

`ActionRegistry` define action ID, risk tier, typed inputs, permiso requerido, preview, approver,
limits, approval expiry, idempotency scope, command adapter, compensation y audit.

### CAD-204-02 — Los tiers 0/1/2/3 quedan definidos con prohibición explícita de Tier 3

Tier 0 es read-only; Tier 1 reversible; Tier 2 financiera/externa exige aprobación humana; Tier 3
destructiva, de otro tenant, de permisos o sobre secrets queda prohibida.

### CAD-204-03 — I0 es suggestion-only y la ejecución permanece `OFF`

I0 es suggestion-only y la ejecución permanece `OFF`.

### CAD-204-04 — Insights desactualizados, predictions desactualizadas o texto inyectado no crean commands ejecutables

Insights/predictions desactualizados o texto inyectado nunca crean command ejecutable.

### CAD-204-05 — Kill switch, budget, rate limits, concurrency limits y reconciliation son obligatorios

Kill switch tenant/global, budget, rate/concurrency limits y reconciliation son obligatorios.

### CAD-204-06 — La aprobación exige evidencia de tiers, suggestion-only, bloqueo por desactualización y reconciliation

La aprobación exige fixtures de registry tiers, suggestion-only, forbidden Tier 3, bloqueo por desactualización,
kill switch y reconciliation.

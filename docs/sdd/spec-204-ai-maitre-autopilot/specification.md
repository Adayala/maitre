# Especificación — SPEC-204 Maitre Autopilot

ActionRegistry define action ID, risk tier, typed inputs, required permission, preview, approver,
limits, approval expiry, idempotency scope, command adapter, compensation y audit.

Tier 0 read-only; Tier 1 reversible; Tier 2 financiera/externa exige aprobación humana; Tier 3
destructiva/cross-tenant/permissions/secrets queda prohibida. I0 es suggestion-only: execution OFF.
Stale insight/prediction o injected text nunca crea command. Kill switch tenant/global, budget,
rate/concurrency limits y reconciliation son obligatorios.

# Especificación — SPEC-204 Maitre Autopilot

ActionRegistry define action ID, risk tier, typed inputs, required permission, preview, approver,
limits, approval expiry, idempotency scope, command adapter, compensation y audit.

Tier 0 read-only; Tier 1 reversible; Tier 2 financiera/externa exige aprobación humana; Tier 3
destructiva/cross-tenant/permissions/secrets queda prohibida. I0 es suggestion-only: execution OFF.
Stale insight/prediction o injected text nunca crea command. Kill switch tenant/global, budget,
rate/concurrency limits y reconciliation son obligatorios.

Autopilot no es “ejecución libre” del modelo: es una capa de policy y registro de acciones permitidas.
En I0 sólo produce sugerencias estructuradas, previews y rationale auditable. La creación del command
real depende de gates humanos y de policy explícita cuando el tier lo permita.

Las acciones prohibidas por tier o por falta de evidencia vigente deben rechazarse de plano, incluso si
un modelo las sugiere. El sistema debe preferir withholding a ejecutar sobre señales stale,
contradictorias o potencialmente inyectadas.

# Contrato IA — SPEC-204 Maitre Autopilot

Proponer acciones desde ActionRegistry con risk tier, inputs, permission, preview, approval expiry,
limits, idempotencia y compensation. I0 es suggestion-only con execution OFF; acciones
destructivas, cross-tenant, permisos o secrets quedan prohibidas. Tests
cubren permisos, límites, doble ejecución, fallo parcial, kill switch, injection y aislamiento.

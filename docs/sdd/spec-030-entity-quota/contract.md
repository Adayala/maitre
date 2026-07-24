# Contrato — SPEC-030 Quota

Quota representa consumo cuantitativo observado/reservado, por ejemplo branches activas o usuarios
habilitados. El límite efectivo pertenece a Entitlement SPEC-029. Campos: `code`, tenant/scope,
período opcional, `used`, unidad, entitlement ref, fuente/revision y timestamps.

`used >= 0` y no puede superar el límite durante una admisión exitosa. `UNLIMITED` y `DENIED` son
valores tipados del Entitlement; ausencia no significa unlimited. Consumo se calcula desde fuente
autoritativa y las mutaciones revalidan/reservan/liberan atómicamente para evitar overbooking. Una
proyección UI puede ser stale, pero el servidor decide. Reducción bajo consumo produce
`PENDING_REMEDIATION`, sin borrar recursos. Tests cubren límite exacto, concurrencia, reconciliación,
reset periódico y cross-tenant.

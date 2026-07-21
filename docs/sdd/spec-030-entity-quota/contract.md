# Contrato — SPEC-030 Quota

Quota representa un límite cuantitativo efectivo, por ejemplo branches o usuarios. Campos:
`code`, tenant/scope, `limit`, unidad, período opcional, fuente, revisión y timestamps.

`limit >= 0`; ausencia no significa ilimitado. `unlimited` requiere valor tipado explícito.
Consumo se calcula desde fuente autoritativa y las mutaciones revalidan atómicamente para
evitar overbooking. La UI puede mostrar estimaciones, pero el servidor decide. Tests cubren
límite exacto, concurrencia, reducción bajo consumo, reset periódico y cross-tenant.

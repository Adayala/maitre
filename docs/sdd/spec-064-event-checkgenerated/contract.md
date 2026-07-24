# Contrato del evento — SPEC-064

No se publica `billing.check.generated.v1`. Los hechos publicables son
`billing.check.opened.v1`, `billing.check.adjusted.v1` y `billing.check.settled.v1`.
Payloads mínimos incluyen scope, Check/Visit, currency, totales permitidos, timestamp y
revisión; adjusted agrega identidad/type/amount del ajuste y settled exige balance cero.
No contienen productos, Guest, Payment details ni Invoice identity. Outbox es atómico y
delivery al menos una vez. Consumidores deduplican y consultan detalle autorizado cuando
corresponde.

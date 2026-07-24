# Rules — SPEC-096

- Entrega por item y entrega agregada no son equivalentes.
- `ordering.order.delivered.v1` sólo se emite al cambiar la derivación agregada a DELIVERED.
- Reintentos o handoffs duplicados no producen una segunda entrega lógica.
- Eventos de entrega no capturan pago ni cierran Check.
- Payload mínimo excluye PII y datos comerciales innecesarios.

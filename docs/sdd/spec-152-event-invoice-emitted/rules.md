# Reglas — SPEC-152

- Es el único evento contable autoritativo post-autorización.
- Se publica sólo cuando la invoice cambia a `AUTHORIZED`.
- Payload omite PII y datos sensibles no necesarios.
- Publicación usa outbox con entrega at-least-once y deduplicación.
- Consumidores contables no deben usar eventos técnicos para contabilizar.

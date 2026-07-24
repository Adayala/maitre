# Rules — SPEC-132

- El contrato publicable es `cash.cash-movement.recorded.v1`.
- Se emite por outbox por cada movimiento aceptado, incluidos compensatorios.
- Payload mínimo excluye PII y texto libre.
- `eventId` y source identity deben permitir dedupe económico robusto.
- Reintentos no generan un segundo hecho lógico equivalente.

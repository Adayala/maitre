# Contrato del evento — SPEC-064

`billing.check.generated.v1` se emite al crear snapshot de Check. Payload mínimo:
tenant/branch, check/visit IDs, currency, subtotal/discount/tax/total, generatedAt y revision;
no contiene productos/guest/payment details. Outbox atómico y delivery al menos una vez.
Consumidores deduplican y consultan detalle autorizado si corresponde. Tests cubren money,
schema, duplicate, stale revision y PII absence.

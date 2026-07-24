# Reglas — SPEC-059

- Amount/currency se validan contra Check revision.
- Provider operation e idempotency key son únicos por operación.
- Timeout ambiguo requiere query/reconcile antes de retry.
- Refund referencia capture y suma refunds <= captured.
- PAN/CVV/secrets nunca atraviesan dominio/API/logs.
- Tenant, Branch y actor derivan del contexto; Check/Payment fuera de scope responde `404`.
- `409` expresa identidad/conflicto monetario, `412` revisión y `422` lifecycle semántico.
- Callback inválido se rechaza antes de lookup; uno válido siempre se acusa de manera no
  enumerable y su receipt se conserva según política.
- Create/capture/refund/CashMovement y sus outbox respetan las fronteras atómicas aprobadas.

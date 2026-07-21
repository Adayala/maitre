# Especificación — SPEC-053

## Schema JSON

```json
{
  "id": "uuid",
  "checkId": "uuid",
  "amount": "decimal",
  "method": "CASH | CARD | TRANSFER",
  "status": "PENDING | APPROVED | DECLINED | REFUNDED",
  "externalTransactionId": "string | null",
  "processedAt": "ISO8601 | null"
}
```

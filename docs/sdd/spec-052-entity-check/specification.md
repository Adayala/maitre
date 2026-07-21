# Especificación — SPEC-052

## Schema JSON

```json
{
  "id": "uuid",
  "visitId": "uuid",
  "status": "OPEN | FINALIZED | PAID",
  "subtotal": "decimal",
  "discountAmount": "decimal",
  "taxAmount": "decimal",
  "tipAmount": "decimal",
  "totalAmount": "decimal",
  "createdAt": "ISO8601",
  "finalizedAt": "ISO8601 | null",
  "paidAt": "ISO8601 | null"
}
```

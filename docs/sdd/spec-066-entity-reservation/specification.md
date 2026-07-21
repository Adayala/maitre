# Especificación — SPEC-066

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "branchId": "uuid",
  "guestId": "uuid",
  "reservationTime": "ISO8601",
  "partySize": "number",
  "status": "PENDING | CONFIRMED | CANCELLED | NOSHOW | COMPLETED",
  "preferences": "JSON",
  "notes": "string",
  "createdAt": "ISO8601"
}
```

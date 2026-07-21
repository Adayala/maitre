# Especificación — SPEC-068

## Schema JSON

```json
{
  "id": "uuid",
  "branchId": "uuid",
  "guestId": "uuid",
  "partySize": "number",
  "status": "WAITING | SEATED | CANCELLED",
  "arrivedAt": "ISO8601",
  "seatedAt": "ISO8601 | null",
  "estimatedWait": "minutes"
}
```

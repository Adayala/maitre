# Especificación — SPEC-049

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "branchId": "uuid",
  "reservationId": "uuid | null",
  "status": "OPEN | PAYING | CLOSED",
  "guestCount": "number",
  "primaryGuestId": "uuid | null",
  "tableIds": ["array of uuid"],
  "openedAt": "ISO8601",
  "closedAt": "ISO8601 | null",
  "estimatedDuration": "minutes",
  "notes": "string"
}
```

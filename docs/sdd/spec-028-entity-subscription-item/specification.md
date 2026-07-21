# Especificación — SPEC-028

## Schema JSON

```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "serviceId": "uuid",
  "status": "ACTIVE | INACTIVE",
  "quantity": "number (branches, users, etc)",
  "unitPrice": "decimal",
  "activatedAt": "ISO8601",
  "deactivatedAt": "ISO8601 | null"
}
```

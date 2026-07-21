# Especificación — SPEC-044

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "actorId": "uuid",
  "action": "CREATE | UPDATE | DELETE",
  "resourceType": "string",
  "resourceId": "uuid",
  "previousState": "JSON",
  "newState": "JSON",
  "ipAddress": "string",
  "userAgent": "string",
  "timestamp": "ISO8601"
}
```

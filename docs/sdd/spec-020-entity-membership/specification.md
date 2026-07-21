# Especificación — SPEC-020

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "userId": "uuid",
  "role": "enum (OWNER, ADMIN, MANAGER, ...)",
  "status": "ACTIVE | INVITED | DEACTIVATED",
  "createdAt": "ISO8601",
  "createdBy": "uuid"
}
```

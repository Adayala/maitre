# Especificación — SPEC-037

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "brandId": "uuid",
  "name": "string (200 max)",
  "slug": "string (unique per brand)",
  "description": "string",
  "status": "ACTIVE | INACTIVE | ARCHIVED",
  "isDefault": "boolean",
  "displayOrder": "number",
  "createdAt": "ISO8601",
  "createdBy": "uuid"
}
```

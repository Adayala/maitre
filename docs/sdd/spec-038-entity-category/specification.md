# Especificación — SPEC-038

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "brandId": "uuid",
  "menuId": "uuid",
  "name": "string (100 max)",
  "slug": "string",
  "description": "string",
  "displayOrder": "number",
  "status": "ACTIVE | INACTIVE | ARCHIVED",
  "createdAt": "ISO8601"
}
```

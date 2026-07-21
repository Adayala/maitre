# Especificación — SPEC-039

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "categoryId": "uuid",
  "name": "string (100 max)",
  "slug": "string",
  "description": "string",
  "price": "decimal (8,2)",
  "imageUrl": "string | null",
  "status": "AVAILABLE | UNAVAILABLE | ARCHIVED",
  "allergens": ["array of strings"],
  "nutritional": { "calories": number, "protein": number },
  "displayOrder": "number",
  "createdAt": "ISO8601"
}
```

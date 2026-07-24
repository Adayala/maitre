# Especificación — SPEC-038

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "menuRevisionId": "uuid",
  "name": "string",
  "description": "string | null",
  "sortOrder": 10,
  "visibility": "VISIBLE | HIDDEN",
  "version": 2
}
```

La relación con Product ocurre por MenuItem (`categoryId + productId`). Category no duplica
brand/menu lifecycle ni contiene una colección autoritativa de Product IDs separada.

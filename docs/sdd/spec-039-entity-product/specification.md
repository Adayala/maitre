# Especificación — SPEC-039

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "string",
  "description": "string",
  "taxCategoryCode": "IVA_21",
  "editorialStatus": "ACTIVE | ARCHIVED",
  "allergenDeclarations": [
    { "code": "GLUTEN", "provenanceRef": "document-id", "verifiedAt": "ISO8601" }
  ],
  "dietaryDeclarations": [],
  "nutrition": null,
  "modifierSetRefs": [],
  "mediaRefs": ["asset-id"],
  "version": 4
}
```

Category, price, currency, display order y operational availability quedan fuera. Esos datos viven
en MenuItem/publication o en proyecciones operativas.

# Especificación — SPEC-037

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "brandId": "uuid",
  "name": "string",
  "status": "DRAFT | PUBLISHED | ARCHIVED",
  "revision": 3,
  "currency": "ARS",
  "branchScopes": ["branch-id"],
  "validFrom": "ISO8601 | null",
  "validUntil": "ISO8601 | null",
  "version": 7
}
```

## Asociación MenuItem

MenuItem es una entidad interna/value association propiedad de una revisión de `Menu`:

```json
{
  "id": "uuid",
  "menuRevisionId": "uuid",
  "categoryId": "uuid",
  "productId": "uuid",
  "price": { "minorUnits": 125000, "currency": "ARS" },
  "taxCategorySnapshot": "IVA_21",
  "modifierSnapshots": [],
  "visibility": "VISIBLE | HIDDEN",
  "catalogEligibility": {
    "status": "ENABLED | DISABLED | SCHEDULED",
    "window": null
  },
  "sortOrder": 10,
  "overrides": {}
}
```

Product no pertenece a una única Category. MenuItem captura colocación/precio/overrides dentro de
la revisión. Publicar valida y congela Categories/MenuItems en una sola operación.

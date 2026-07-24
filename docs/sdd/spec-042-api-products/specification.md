# Especificación — SPEC-042

## Endpoints

### `GET /v1/products`

Lista Products tenant-scoped con filtros editoriales, refs y cursor/orden estable. No lista
colocaciones/precios de MenuItem.

### `POST /v1/products`

```json
{
  "name": "Milanesa",
  "description": "string",
  "taxCategoryCode": "IVA_21",
  "allergenDeclarations": [],
  "dietaryDeclarations": [],
  "nutrition": null,
  "modifierSetRefs": [],
  "mediaRefs": ["asset-id"]
}
```

### `GET /v1/products/{productId}`

Devuelve la definición editorial autorizada y ETag.

### `PATCH /v1/products/{productId}`

Actualiza campos editoriales/refs con `If-Match`. `editorialStatus: ARCHIVED` preserva historia.

## Fuera de alcance

- Category/MenuItem placement;
- precio, currency, tax snapshot o display order de un menú;
- availability/stock operativo;
- upload multipart, fetching de URL o configuración CDN;
- hard delete.

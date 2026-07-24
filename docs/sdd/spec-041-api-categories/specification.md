# Especificación — SPEC-041

## Endpoints

### `GET /v1/menu-revisions/{menuRevisionId}/categories`

Lista Categories del DRAFT/snapshot autorizado en orden `sortOrder,id`.

### `POST /v1/menu-revisions/{menuRevisionId}/categories`

```json
{
  "name": "Entradas",
  "description": null,
  "sortOrder": 10,
  "visibility": "VISIBLE"
}
```

### `PATCH /v1/categories/{categoryId}`

Modifica Category DRAFT con `If-Match`; no cambia menuRevisionId.

### `POST /v1/menu-revisions/{menuRevisionId}/categories/reorder`

```json
{
  "categoryIds": ["category-a", "category-b"],
  "expectedRevision": 4
}
```

El conjunto debe coincidir exactamente con las Categories reordenables de la revisión.

Ocultar/remover de DRAFT usa PATCH/command explícito; no hay DELETE físico.

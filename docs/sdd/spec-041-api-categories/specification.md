# Especificación — SPEC-041

## Endpoints

### GET /menus/:menuId/categories
Listar categorías del menú.

### POST /menus/:menuId/categories
```
Request:
{ "name": "string", "slug": "string" }

Response (201):
{ "data": { id, name, slug, displayOrder } }
```

### PATCH /categories/:id
Actualizar nombre, orden, status.

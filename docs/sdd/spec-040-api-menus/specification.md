# Especificación — SPEC-040

## Endpoints

### GET /brands/:brandId/menus
Listar menús de marca.

### POST /brands/:brandId/menus
```
Request:
{ "name": "string", "slug": "string" }

Response (201):
{ "data": { id, name, slug, ... } }
```

### GET /menus/:id
Detalle menú + categorías.

### PATCH /menus/:id
Actualizar nombre, slug, status.

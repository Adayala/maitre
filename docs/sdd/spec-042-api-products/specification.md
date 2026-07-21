# Especificación — SPEC-042

## Endpoints

### GET /categories/:categoryId/products
Listar productos de categoría.

### POST /categories/:categoryId/products
```
Request:
{ 
  "name": "string",
  "slug": "string",
  "price": "decimal",
  "description": "string",
  "image": "file | url"
}

Response (201):
{ "data": { id, name, price, imageUrl } }
```

### PATCH /products/:id
Actualizar nombre, precio, descripción, imagen, status.

# Especificación — SPEC-011

## Endpoints

### POST /salons (Crear salón)
```
Request:
{
  "branchId": "uuid",
  "name": "string (1-50)",
  "maxCapacity": "integer (máx huéspedes en salón)",
  "description": "string | null"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "branchId": "uuid",
    "name": "...",
    "maxCapacity": 50,
    "createdAt": "ISO8601"
  }
}
```

### GET /salons (Listar)
Filtrar por branchId.

Response (200):
```json
{
  "data": [{ id, name, max_capacity }, ...],
  "meta": { "total": 3 }
}
```

### GET /salons/:id (Detalle)
Incluye mesas del salón.

### PATCH /salons/:id (Actualizar)
Campos: name, maxCapacity, description

Response (200): Salón actualizado

## Autorización

- POST /salons → OWNER, ADMIN
- GET /salons → OWNER, ADMIN, MANAGER
- PATCH /salons/:id → OWNER, ADMIN

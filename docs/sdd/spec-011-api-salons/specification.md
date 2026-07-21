# Especificación — SPEC-011

## Endpoints

### POST /salons (Crear salón)
```
Request:
{
  "branch_id": "uuid",
  "name": "string (1-50)",
  "max_capacity": "integer (max huéspedes en salón)",
  "description": "string | null"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "branch_id": "uuid",
    "name": "...",
    "max_capacity": 50,
    "created_at": "ISO8601"
  }
}
```

### GET /salons (Listar)
Filtrar por branch_id.

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
Campos: name, max_capacity, description

Response (200): Salón actualizado

## Authorization

- POST /salons → OWNER, ADMIN
- GET /salons → OWNER, ADMIN, MANAGER
- PATCH /salons/:id → OWNER, ADMIN

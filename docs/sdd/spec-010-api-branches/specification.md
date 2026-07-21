# Especificación — SPEC-010

## Endpoints

### POST /branches (Crear sucursal)
```
Request:
{
  "brand_id": "uuid",
  "name": "string (1-100)",
  "address": "string",
  "phone": "string (E.164) | null",
  "fiscal_entity_id": "uuid (fiscal del recibo)"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "brand_id": "uuid",
    "name": "...",
    "status": "ACTIVE",
    "created_at": "ISO8601"
  }
}
```

### GET /branches (Listar)
Con paginación.

Response (200):
```json
{
  "data": [{ id, name, brand_id, status }, ...],
  "meta": { "total": 5, "page": 1 }
}
```

### GET /branches/:id (Detalle)
Response (200): Sucursal completa con salones

### PATCH /branches/:id (Actualizar)
Campos: name, address, phone, status

Response (200): Sucursal actualizada

## Authorization

- POST /branches → OWNER, ADMIN (respeta max_branches del plan)
- GET /branches → OWNER, ADMIN, MANAGER
- PATCH /branches/:id → OWNER, ADMIN

# Especificación — SPEC-008

## Endpoints

### POST /brands (Crear marca)
```
Request:
{
  "name": "string (1-100)",
  "description": "string | null",
  "logo_url": "string (URL) | null",
  "default_menu_id": "uuid | null"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "...",
    "slug": "...",
    "status": "ACTIVE",
    "created_at": "ISO8601"
  }
}
```

### GET /brands (Listar marcas)
Paginación con limit/offset.

Response (200):
```json
{
  "data": [{ id, name, slug, status, created_at }, ...],
  "meta": { "total": 5, "page": 1, "limit": 20 }
}
```

### GET /brands/:id (Detalle marca)
Response (200): Marca completa

### PATCH /brands/:id (Actualizar marca)
Campos: name, description, logo_url, status (ACTIVE/INACTIVE/ARCHIVED)

Response (200): Marca actualizada

### DELETE /branches/:id (Archivar marca)
Soft delete - transición a ARCHIVED.

Response (204): No content

## Authorization

- POST /brands → OWNER, ADMIN
- GET /brands, GET /brands/:id → OWNER, ADMIN, MANAGER
- PATCH /brands/:id → OWNER, ADMIN
- DELETE /brands/:id → OWNER only

## Validaciones

- name: min 3 chars, max 100
- slug: auto-generated, unique per tenant
- logo_url: must be valid URL

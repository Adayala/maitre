# Especificación — SPEC-007

## Endpoints

### POST /tenants (Crear tenant)
```
Request:
{
  "name": "string (1-100)",
  "contactEmail": "string | null",
  "contactPhone": "string | null (E.164)",
  "defaultTimezone": "string (IANA)"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "name": "...",
    "status": "ACTIVE",
    "createdAt": "ISO8601"
  },
  "meta": { "correlationId" }
}
```

### GET /tenants/:id (Detalle tenant)
Requiere autenticación como OWNER.

Response (200):
```json
{
  "data": {
    "id": "uuid",
    "name": "...",
    "contactEmail": "...",
    "status": "ACTIVE",
    "defaultTimezone": "America/Argentina/Buenos_Aires",
    "createdAt": "ISO8601"
  }
}
```

### PATCH /tenants/:id (Actualizar tenant)
Solo OWNER puede actualizar.

Campos permitidos: name, contactPhone, defaultTimezone

Response (200): Tenant actualizado

## Authorization

- POST /tenants → provisioning privilegiado
- GET /tenants/:id → OWNER, ADMIN
- PATCH /tenants/:id → OWNER only

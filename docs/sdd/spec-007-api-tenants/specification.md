# Especificación — SPEC-007

## Endpoints

### POST /tenants (Crear tenant)
```
Request:
{
  "name": "string (1-100)",
  "contact_email": "string (unique globally)",
  "contact_phone": "string | null (E.164)",
  "billing_country": "string (ISO 3166-1)",
  "business_type": "string",
  "plan_tier": "STARTER | PROFESSIONAL | ENTERPRISE"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "name": "...",
    "status": "TRIAL",
    "plan_tier": "STARTER",
    "created_at": "ISO8601"
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
    "contact_email": "...",
    "status": "ACTIVE",
    "plan_tier": "PROFESSIONAL",
    "max_branches": 10,
    "max_users": 50,
    "created_at": "ISO8601"
  }
}
```

### PATCH /tenants/:id (Actualizar tenant)
Solo OWNER puede actualizar.

Campos permitidos: name, contact_phone, billing_country, default_timezone

Response (200): Tenant actualizado

### GET /tenants/:id/usage (Uso de recursos)
```json
{
  "data": {
    "branches": { "used": 3, "limit": 10 },
    "users": { "used": 12, "limit": 50 },
    "tables": { "used": 45, "limit": 200 }
  }
}
```

## Authorization

- POST /tenants → Public (primer tenant)
- GET /tenants/:id → OWNER, ADMIN
- PATCH /tenants/:id → OWNER only
- GET /tenants/:id/usage → OWNER, ADMIN

## Rate Limits

- 10 requests per minute per tenant
- Throttle response: 429 Too Many Requests

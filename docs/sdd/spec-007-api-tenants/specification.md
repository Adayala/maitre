# Especificación — SPEC-007

## Endpoints

### POST /tenants
Crear tenant (público, sin auth).
```
Request: { name, email, country, timezone }
Response 201: { id, name, email, status: ACTIVE, subscription: { id, status: TRIALING } }
```

### GET /tenants/:id
Obtener tenant (requiere auth).
```
Response 200: { id, name, email, brands, branches, subscription, entitlements }
```

### PATCH /tenants/:id
Actualizar tenant.
```
Request: { name, email, ... }
Response 200: { id, ... }
```

## Validaciones

- Email único globally
- Email válido RFC 5322
- Country ISO 3166-1 alpha-2
- Timezone IANA válido

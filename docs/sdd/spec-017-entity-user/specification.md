# Especificación — SPEC-017

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "email": "string (único per tenant)",
  "name": "string",
  "status": "INVITED | ACTIVE | DEACTIVATED",
  "role": "enum (OWNER, ADMIN, ...)",
  "password_hash": "string (bcrypt)",
  "email_verified": "boolean",
  "email_verified_at": "ISO8601 | null",
  "last_login_at": "ISO8601 | null",
  "createdAt": "ISO8601",
  "createdBy": "uuid"
}
```

## Validaciones

- Email: RFC 5322 + unique per tenant
- Name: 2-100 chars
- Password: min 12 chars, complexity
- Status: solo valores enumerados

# Especificación — SPEC-029

## Schema JSON

```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "resource": "branches | users | orders | api_calls | storage",
  "softLimit": "number | null",
  "hardLimit": "number",
  "overrideReason": "string | null",
  "expiresAt": "ISO8601 | null"
}
```

Ejemplo: { resource: "branches", hardLimit: 3, softLimit: 2 }

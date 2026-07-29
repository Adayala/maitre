# Especificación — SPEC-230

## Endpoint

`GET /v1/subscriptions/{tenantId}/access?branchId={uuid}`

## Respuesta

```json
{
  "data": {
    "tenantId": "uuid",
    "branchId": "uuid | null",
    "services": [
      {
        "code": "KITCHEN",
        "quantity": 1,
        "scopeRefId": "branch-uuid"
      }
    ]
  }
}
```

Sin `branchId`, devuelve únicamente alcance `TENANT`. Con `branchId`, agrega los ítems cuyo
`scopeRefId` coincide exactamente. `code` usa `catalogItemCode` con fallback temporal a
`serviceId`.

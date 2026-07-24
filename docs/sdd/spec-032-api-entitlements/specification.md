# Especificación — SPEC-032

## Endpoints

### `GET /v1/entitlements`

```json
{
  data: {
    entitlements: [
      {
        "code": "branches.maximum",
        "scope": { "type": "TENANT", "id": "uuid" },
        "value": { "type": "LIMITED", "limit": 3 },
        "validUntil": null
      }
    ],
    quotas: [
      {
        "code": "branches.active",
        "scope": { "type": "TENANT", "id": "uuid" },
        "used": 1,
        "unit": "COUNT",
        "entitlementCode": "branches.maximum",
        "reconciliationStatus": "IN_SYNC"
      }
    ]
  },
  meta: {
    "calculationRevision": "entitlements-v1",
    "computedAt": "ISO8601",
    "authoritativeForMutation": false
  }
}
```

Soporta filtros `code` y alcance por sucursal permitido. La respuesta no contiene SubscriptionItem/pricing
salvo un contrato explícito futuro.

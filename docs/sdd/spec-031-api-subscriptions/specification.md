# Especificación — SPEC-031

## Endpoints

### `GET /v1/subscription`

Devuelve la Subscription vigente del contexto autenticado, sus items visibles, revisión y estado de
recomputación. El Tenant se resuelve server-side.

### `POST /v1/subscriptions`

Provisioning de plataforma, no endpoint tenant común:

```json
{
  "tenantId": "uuid",
  "catalogVersion": 1,
  "period": { "startsAt": "ISO8601", "endsAt": null },
  "items": [
    {
      "serviceCode": "floor",
      "quantity": 1,
      "branchScopes": [],
      "config": {}
    }
  ]
}
```

Requiere capability de plataforma, Idempotency-Key y auditoría. `tenantId` sólo se acepta en este
workflow privilegiado.

### `PATCH /v1/subscriptions/{subscriptionId}`

Requiere `If-Match`. Puede proponer status/período/items conforme a catálogo. Desactivar un item
preserva su identidad/historia; no existe DELETE. Una reducción incompatible responde `422` con
estado/remediation aplicable.

## Fuera de alcance

- `/upgrade`, billing cycle, precio, charge, refund y proration;
- hard delete;
- writes de Entitlement/Quota;
- tenantId arbitrario en endpoints de usuario tenant.

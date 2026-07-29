# Especificación — SPEC-028

## Schema JSON

```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "catalogItemCode": "SEATS",
  "serviceCode": "SEATS",
  "status": "ACTIVE | INACTIVE",
  "quantity": 12,
  "scopeRefId": "branch-uuid | null",
  "unitPrice": 500,
  "activatedAt": "ISO8601",
  "deactivatedAt": "ISO8601 | null"
}
```

- `catalogItemCode` referencia `subscription_catalog_items.code`; `serviceCode` se conserva como
  alias de compatibilidad durante la transición.
- `quantity` debe ser un entero positivo y sólo representa unidades comerciales cuando el catálogo
  declara `billingType=QUANTITY`; los servicios usan cantidad efectiva `1`.
- `scopeRefId` es obligatorio para alcances distintos de `TENANT`.
- La unicidad contractual es
  `(subscriptionId, catalogItemCode, scopeRefId)` con `NULLS NOT DISTINCT`, por lo que un ítem tenant
  tampoco puede duplicarse.

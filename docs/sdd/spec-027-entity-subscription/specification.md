# Especificación — SPEC-027

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "status": "TRIAL | ACTIVE | SUSPENDED | CANCELLED",
  "catalogVersion": 1,
  "period": {
    "startsAt": "ISO8601",
    "endsAt": "ISO8601 | null"
  },
  "version": 1,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

Los servicios contratados son `SubscriptionItem` de SPEC-028. Un plan comercial puede ser metadata
de catálogo, pero no reemplaza service codes/version ni se interpreta como permission. Billing
cycle, precio, auto-renew y cobros quedan fuera del MVP gratuito hasta contrato específico.

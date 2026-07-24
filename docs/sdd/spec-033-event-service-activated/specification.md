# Especificación — SPEC-033

## Schema

```json
{
  "eventId": "uuid",
  "eventName": "subscription.service.activated.v1",
  "eventVersion": 1,
  "aggregateId": "itemId",
  "aggregateType": "SubscriptionItem",
  "tenantId": "uuid",
  "occurredAt": "ISO8601",
  "correlationId": "uuid",
  "payload": {
    "subscriptionId": "uuid",
    "itemId": "uuid",
    "serviceCode": "floor",
    "scopes": [{ "type": "TENANT", "id": "uuid" }],
    "effectiveAt": "ISO8601",
    "sourceRevision": 7,
    "calculationRevision": "entitlements-v1"
  }
}
```

El evento no incluye price/payment ni reemplaza el resultado de SPEC-035.

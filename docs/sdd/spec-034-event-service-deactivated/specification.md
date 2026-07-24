# Especificación — SPEC-034

## Schema

```json
{
  "eventId": "uuid",
  "eventName": "subscription.service.deactivated.v1",
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
    "affectedScopes": [{ "type": "TENANT", "id": "uuid" }],
    "effectiveAt": "ISO8601",
    "reasonCode": "CONTRACT_CHANGED",
    "sourceRevision": 8,
    "calculationRevision": "entitlements-v1"
  }
}
```

El evento no ordena borrar datos ni cancelar operaciones en curso. Es una señal de cambio de fuente
para recomputación/invalidation.

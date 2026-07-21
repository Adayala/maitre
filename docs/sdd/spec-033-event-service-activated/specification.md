# Especificación — SPEC-033

## Schema

```json
{
  "eventId": "uuid",
  "eventName": "ServiceActivated",
  "eventVersion": "1.0",
  "namespace": "maitre.subscription",
  "aggregateId": "subscriptionId",
  "aggregateType": "Subscription",
  "tenantId": "uuid",
  "timestamp": "ISO8601",
  "correlationId": "uuid",
  "payload": {
    "subscriptionId": "uuid",
    "serviceId": "uuid",
    "serviceName": "string",
    "activatedAt": "ISO8601"
  }
}
```

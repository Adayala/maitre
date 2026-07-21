# Especificación — SPEC-025

## Schema

```json
{
  "eventId": "uuid",
  "eventName": "UserAuthenticated",
  "eventVersion": "1.0",
  "namespace": "maitre.identity",
  "aggregateId": "userId",
  "aggregateType": "User",
  "tenantId": "uuid",
  "timestamp": "ISO8601",
  "correlationId": "uuid",
  "payload": {
    "userId": "uuid",
    "email": "string",
    "ipAddress": "string",
    "userAgent": "string"
  }
}
```

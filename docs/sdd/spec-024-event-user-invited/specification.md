# Especificación — SPEC-024

## Schema

```json
{
  "eventId": "uuid",
  "eventName": "UserInvited",
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
    "name": "string",
    "inviteLink": "string"
  }
}
```

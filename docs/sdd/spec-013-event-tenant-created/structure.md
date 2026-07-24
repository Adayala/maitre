# Structure — Event

**Spec:** SPEC-013

## Base structure

All events have:
```json
{
  "eventId": "uuid",
  "eventName": "EventName",
  "eventVersion": "1.0",
  "namespace": "maitre.organization",
  "aggregateId": "uuid",
  "aggregateType": "EntityType",
  "tenantId": "uuid",
  "timestamp": "ISO8601",
  "correlationId": "uuid",
  "payload": { ... }
}
```

## Payload

Event-specific data in payload field.

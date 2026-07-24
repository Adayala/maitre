# Especificación — SPEC-024

## Schema

```json
{
  "eventId": "uuid",
  "eventName": "identity.user.invited.v1",
  "eventVersion": 1,
  "aggregateId": "invitationId",
  "aggregateType": "MembershipInvitation",
  "tenantId": "uuid",
  "occurredAt": "ISO8601",
  "correlationId": "uuid",
  "payload": {
    "invitationId": "uuid",
    "userId": "uuid-or-null",
    "recipientRef": "opaque-reference",
    "roles": ["WAITER"],
    "branchScope": {
      "mode": "SELECTED_BRANCHES",
      "branchIds": ["uuid"]
    },
    "invitedBy": "user-id",
    "expiresAt": "ISO8601",
    "createdAt": "ISO8601"
  }
}
```

`recipientRef` no es el token de invitación. Token/link y email completo quedan fuera del evento.
Una revisión lógica nueva usa nueva invitation/event identity; un retry físico conserva eventId.

# Especificación — SPEC-025

## Schema

```json
{
  "eventId": "uuid",
  "eventName": "identity.user.authenticated.v1",
  "eventVersion": 1,
  "aggregateId": "userId",
  "aggregateType": "User",
  "tenantId": "uuid-or-null",
  "occurredAt": "ISO8601",
  "correlationId": "uuid",
  "payload": {
    "userId": "uuid",
    "provider": "provider-id",
    "authenticationMethod": "PASSWORD_OR_PROVIDER_CATEGORY",
    "sessionRef": "opaque-reference",
    "validatedTenantContextId": "uuid-or-null",
    "riskSignals": ["non-identifying-category"]
  }
}
```

El evento se origina al observar una autenticación exitosa del provider, no desde un endpoint
Maitre `/auth/login`. IP completa, user-agent crudo, email, memberships y tokens quedan fuera.

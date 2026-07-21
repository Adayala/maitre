# Especificación — SPEC-031

## Endpoints

### GET /subscriptions/:tenantId
Subscription actual del tenant.

### POST /subscriptions/upgrade
```
Request:
{ "planId": "uuid", "billingCycle": "MONTHLY" }

Response (200):
{ data: { subscription } }
```

### POST /subscriptions/:id/services
Agregar servicio.

### DELETE /subscriptions/:id/services/:serviceId
Remover servicio.

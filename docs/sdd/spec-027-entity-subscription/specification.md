# Especificación — SPEC-027

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "planId": "uuid",
  "status": "TRIAL | ACTIVE | SUSPENDED | CANCELLED",
  "billingCycle": "MONTHLY | ANNUALLY",
  "startDate": "ISO8601",
  "renewalDate": "ISO8601",
  "cancellationDate": "ISO8601 | null",
  "currentPeriodStart": "ISO8601",
  "currentPeriodEnd": "ISO8601",
  "autoRenew": "boolean",
  "createdAt": "ISO8601"
}
```

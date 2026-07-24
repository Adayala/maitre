# Especificación — SPEC-030

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "code": "branches.active",
  "scope": { "type": "TENANT", "id": "uuid" },
  "period": null,
  "used": 2,
  "unit": "COUNT",
  "entitlementId": "uuid",
  "sourceRevision": "uuid-or-sequence",
  "reconciliationStatus": "IN_SYNC | PENDING_REMEDIATION | DRIFTED",
  "computedAt": "ISO8601"
}
```

Quota no almacena el límite como segunda autoridad. La comparación usa el Entitlement efectivo
referenciado y la operación de admisión revalida la fuente autoritativa.

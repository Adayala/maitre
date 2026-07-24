# Especificación — SPEC-029

## Schema JSON

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "code": "branches.maximum",
  "scope": { "type": "TENANT", "id": "uuid" },
  "value": { "type": "LIMITED", "limit": 3 },
  "sourceRefs": ["subscription-item-id", "override-id"],
  "calculationRevision": "entitlements-v1",
  "validFrom": "ISO8601",
  "validUntil": "ISO8601 | null",
  "computedAt": "ISO8601"
}
```

Valores cuantitativos distinguen explícitamente `LIMITED`, `UNLIMITED` y `DENIED`; ausencia no
significa unlimited. Warning/soft threshold, cuando exista, forma parte del tipo/catalog policy.
Override es una fuente auditada, no un campo editable de esta proyección.

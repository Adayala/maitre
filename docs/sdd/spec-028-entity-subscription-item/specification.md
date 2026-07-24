# Especificación — SPEC-028

## Schema JSON

```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "serviceCode": "floor",
  "catalogVersion": 1,
  "status": "ACTIVE | INACTIVE",
  "quantity": 1,
  "branchScopes": ["branch-id"],
  "config": {},
  "validFrom": "ISO8601",
  "validUntil": "ISO8601 | null",
  "version": 1
}
```

`config` se valida contra el schema versionado del service catalog. `unitPrice` no pertenece al
contrato de autorización y no se incorpora hasta especificar billing/catalog snapshots.

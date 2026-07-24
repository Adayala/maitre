# Especificación — SPEC-045

## Endpoints

### `GET /v1/audit-logs`

```text
Query params:
?actorId=opaque-id
?action=branch.update
?resourceType=Branch
?resourceId=uuid
?from=ISO8601
?to=ISO8601
?limit=100
?cursor=opaque
```

Response usa cursor opaco y no promete total exacto:

```json
{
  "data": [
    {
      "id": "uuid",
      "occurredAt": "ISO8601",
      "actor": { "type": "USER", "id": "opaque-id" },
      "action": "branch.update",
      "resource": { "type": "Branch", "id": "uuid" },
      "outcome": "SUCCEEDED",
      "reasonCode": "UPDATED",
      "diff": { "redactedFields": ["phone"] },
      "correlationId": "uuid"
    }
  ],
  "meta": { "nextCursor": "opaque-or-null", "retentionPolicyId": "ref" }
}
```

Detalle/export no pertenecen a v1. Un export futuro es job asíncrono con snapshot/hash/expiry.

# Especificación — SPEC-045

## Endpoints

### `GET /v1/audit-logs`

```text
Query params:
?actor_id=opaque-id
?resource_type=Branch
?from=ISO8601
?to=ISO8601
?limit=100
?cursor=opaque
```

Response I0 usa cursor opaco y no promete total exacto:

```json
{
  "data": [
    {
      "id": "uuid",
      "occurredAt": "ISO8601",
      "actorType": "USER",
      "actorId": "opaque-id",
      "action": "UPDATE",
      "resourceType": "Branch",
      "resourceId": "uuid",
      "correlationId": "uuid-or-null"
    }
  ],
  "meta": { "limit": 100, "nextCursor": "opaque-or-null" }
}
```

El I0 actual no filtra por `action` ni `resourceId` desde la API route, aunque el dominio sí
conserva esos campos en los registros. Tampoco expone `outcome`, `reasonCode`, `diff` ni
`retentionPolicyId` en la respuesta pública actual.

Detalle/export no pertenecen a v1. Un export futuro es job asíncrono con snapshot/hash/expiry.

# Especificación — SPEC-045

## Endpoints

### GET /audit
```
Query params:
?actor_id=uuid
?resource_type=Branch
?from=ISO8601
?to=ISO8601
?limit=100

Response (200):
{ 
  data: [
    { id, action, resourceType, actorId, timestamp, ... }
  ],
  meta: { total, limit, offset }
}
```

### GET /audit/export
Descarga CSV.

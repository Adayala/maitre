# Structure — API

**Spec:** SPEC-008

## Endpoint structure

All endpoints require:
- Authorization header (Bearer token)
- X-Tenant-Id header
- X-Branch-Id header (if branch-scoped)

## Response format

```json
{
  "data": { ... },
  "meta": { "timestamp": "ISO8601" }
}
```

## Error codes

- 400: Bad Request (validation)
- 401: Unauthorized
- 403: Forbidden (no entitlement)
- 404: Not Found
- 409: Conflict (unique constraint)
- 429: Rate Limited
- 500: Server Error

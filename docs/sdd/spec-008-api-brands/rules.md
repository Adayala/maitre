# Rules — API

## Authorization

Every endpoint checks:
1. User authenticated
2. User in tenant (X-Tenant-Id)
3. User has permission
4. User has branch scope (if applicable)

## Validation

- Input validated before DB
- Errors returned with field+reason
- Idempotency-Key for POST/PATCH

## Isolation

All queries filtered by tenant_id.

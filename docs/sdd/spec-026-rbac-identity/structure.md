# Structure — SPEC-026

Middleware checks:
1. Authenticated
2. In tenant via X-Tenant-Id
3. Has role in tenant (from membership)
4. Has permission for action+resource

Entrypoint: authorization middleware.

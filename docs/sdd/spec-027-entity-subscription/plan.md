# Plan — SPEC-027

## Componentes

- Subscription entity
- subscriptions table (FK tenant, plan)
- Status transitions
- Renewal scheduling
- POST /subscriptions (subscribe to plan)
- GET /subscriptions/:tenantId

## Dependencias

**Must be:** SPEC-001 Tenant

**Depends:** SPEC-031 Subscriptions API, SPEC-029 Entitlements

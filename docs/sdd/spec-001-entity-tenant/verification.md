# Verificación — SPEC-001

## Criterios de terminación

- [ ] All 8 docs complete ✅
- [ ] Code merged to main
- [ ] Tests > 80% coverage
- [ ] Deployed to staging
- [ ] Code review approved by 2 reviewers

## Test plan

### Unit tests

- Email validation (valid, invalid, duplicates)
- Timezone validation (valid IANA, invalid)
- Country validation (ISO 3166-1)
- Status transitions (valid only)
- UUID generation

### Integration tests

- POST /tenants → brand new tenant created
- GET /tenants/:id → obtener datos correctos
- PATCH /tenants/:id → update fields (name, email status)
- TenantCreated event emitted to event bus
- AuditLog entry created for each operation
- Subscription auto-created on creation
- Owner user auto-created on creation
- Multi-tenant isolation verified (User A cannot access Tenant B)

### E2E tests

- Full registration flow: POST /tenants → GET /tenants/:id → verify created
- Subscription verification: GET /subscriptions/:id from created tenant
- Owner verification: GET /users for created tenant shows owner

## Validación de criterios de aceptación

| CAD | Test | Expected | Status |
| --- | --- | --- | --- |
| CAD-1 | test_create_tenant | email unique, name 3-100, country ISO, timezone IANA | ⏳ |
| CAD-2 | test_status_transitions | ACTIVE ↔ SUSPENDED → ARCHIVED, no invalid | ⏳ |
| CAD-3 | test_crud_api | POST 201, GET 200, PATCH 200, isolation 403 | ⏳ |
| CAD-4 | test_event_emitted | TenantCreated event in event bus | ⏳ |
| CAD-5 | test_isolation | Tenant A data not visible to Tenant B | ⏳ |
| CAD-6 | test_auditlog | CREATE, UPDATE, SUSPEND events logged | ⏳ |

## Sign-off

**Reviewed by:** @peer1, @peer2 (pending)
**Tested by:** @qa-team (pending)
**Status:** PENDING ⏳

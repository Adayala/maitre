# Verificación — SPEC-002

## Criterios de terminación

- [ ] Code merged a main
- [ ] All tests passing (coverage > 80%)
- [ ] Deployed a staging
- [ ] Documentation updated
- [ ] Code review approved

## Test plan

### Unit tests

- Test slug generation (normalización)
- Test status transitions (máquina de estados)
- Test config inheritance
- Test validation (name length, etc)

### Integration tests

- Create brand → BrandCreated event emitido
- List brands por tenant → aislación verificada
- Intentar acceder a brand de otro tenant → 403
- Update brand → AuditLog entry created

### E2E tests

- POST /brands → GET /brands/:id → PATCH → verificar cambios

## Validación de criterios de aceptación

| CAD | Test | Status |
| --- | --- | --- |
| CAD-1 | test_create_brand | ⏳ |
| CAD-2 | test_inheritance | ⏳ |
| CAD-3 | test_crud_api | ⏳ |
| CAD-4 | test_brand_created_event | ⏳ |
| CAD-5 | test_tenant_isolation | ⏳ |

## Sign-off

**Verificado por:** @faguero (pending)
**Fecha:** 2026-07-20 (pending)
**Status:** PENDING ⏳

# Plan — API

**Spec:** SPEC-009

- Reconciliar contrato HTTP con SPEC-003 (`taxCondition` vs `regime`, campos opcionales y redacción)
- Implementar create/list/get/PATCH tenant-safe con RBAC fiscal explícito
- Añadir concurrencia optimista con `If-Match` en PATCH
- Añadir create idempotente con `Idempotency-Key` o estrategia equivalente aprobada
- Mantener secretos/certificados fuera del response y de logs
- Cubrir Problem Details, aislamiento cross-tenant y pruebas contractuales

**Est: 12-16h per API (multiple endpoints)**

# Tasks — SPEC-004

- [ ] Aprobar campos, estados y reglas same-tenant.
- [ ] Validar dependencias contra SPEC-001, SPEC-002 y SPEC-003 reconciliadas.
- [ ] Crear migración y rollback de `branches`.
- [ ] Añadir constraints compuestas a Brand/FiscalEntity cuando se aprueben sus specs.
- [ ] Implementar Branch, Address y value objects.
- [ ] Implementar mapping camelCase ↔ snake_case.
- [ ] Definir e implementar `BranchRepository` tenant-safe.
- [ ] Implementar creación y transiciones de estado autorizadas.
- [ ] Integrar `BranchCreated` con transactional outbox.
- [ ] Añadir tests unitarios, integración y Tenant A/B.
- [ ] Verificar que no existan `services_active`, `config` o `menu_id`.
- [ ] Adjuntar evidencia en `verification.md` antes de cambiar status.

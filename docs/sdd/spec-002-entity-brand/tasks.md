# Tasks — SPEC-002

- [ ] Aprobar campos normativos y set cerrado de defaults herederos.
- [ ] Confirmar política de generación y mutación de `slug`.
- [ ] Reconciliar `defaultMenuId` como referencia opcional y no como ownership.
- [ ] Diseñar migración con `(tenant_id, slug)` único y rollback probado.
- [ ] Definir Brand y value objects sin acoplarla a endpoints HTTP.
- [ ] Implementar mapping camelCase ↔ snake_case cuando se pase a ejecución.
- [ ] Definir `BrandRepository` tenant-safe.
- [ ] Integrar outbox para `BrandCreated` y cambios relevantes.
- [ ] Añadir tests de normalización, lifecycle, same-tenant y Tenant A/B.
- [ ] Adjuntar evidencia en `verification.md` antes de cambiar status.

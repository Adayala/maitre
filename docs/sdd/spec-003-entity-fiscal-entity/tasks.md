# Tasks — SPEC-003

- [ ] Aprobar campos obligatorios, catálogo fiscal y lifecycle.
- [ ] Confirmar política de unicidad de CUIT por tenant y tratamiento cross-tenant.
- [ ] Definir modelo de referencia segura para certificados y claves.
- [ ] Reconciliar la relación con FiscalPoint y Branch.
- [ ] Diseñar migración con unique `(tenant_id, cuit)` y rollback probado.
- [ ] Definir FiscalEntity y validadores puros.
- [ ] Definir `FiscalEntityRepository` tenant-safe.
- [ ] Preparar controles de auditoría, concurrencia y outbox.
- [ ] Añadir tests de checksum, vencimiento, same-tenant y Tenant A/B.
- [ ] Adjuntar evidencia en `verification.md` antes de cambiar status.

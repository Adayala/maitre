# Tasks — SPEC-001

- [ ] Aprobar campos, estados y transiciones del agregado.
- [ ] Registrar decisión de actor `SYSTEM` y orden de bootstrap.
- [ ] Crear migración con `timestamptz`, checks y rollback probado.
- [ ] Implementar Tenant y validadores sin dependencias de infraestructura.
- [ ] Implementar mapper camelCase ↔ snake_case.
- [ ] Definir e implementar `TenantRepository` con queries tenant-safe.
- [ ] Diseñar workflow de provisioning autenticado e idempotente.
- [ ] Integrar transactional outbox para `TenantCreated`.
- [ ] Orquestar Membership OWNER sin acoplar User a Tenant.
- [ ] Orquestar Subscription inicial sin copiar plan/capacidades a Tenant.
- [ ] Añadir Problem Details y autorización a endpoints aprobados.
- [ ] Añadir tests unitarios, integración y Tenant A/B.
- [ ] Adjuntar evidencia en `verification.md` antes de cambiar status.

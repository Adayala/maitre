# Plan — SPEC-001

1. Aprobar el agregado, estados y separación respecto de Subscription/Entitlement.
2. Definir migración `tenants` con constraints, timestamps y actor system nullable.
3. Implementar entity y value objects de locale, currency y timezone.
4. Definir `TenantRepository` tenant-safe y adaptador PostgreSQL.
5. Implementar casos de uso de provisioning, consulta y actualización permitida.
6. Registrar `TenantCreated` mediante transactional outbox.
7. Integrar Membership OWNER y Subscription como pasos orquestados, no como side effects de la entity.
8. Añadir tests de estados, mapping, idempotencia y aislamiento Tenant A/B.

La estimación se realiza tras aprobar contratos de provisioning y outbox.

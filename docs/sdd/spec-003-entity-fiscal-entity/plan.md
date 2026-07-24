# Plan — SPEC-003

1. Aprobar el agregado fiscal mínimo y su separación respecto de comprobantes, puntos de venta y certificados.
2. Congelar catálogo de `taxCondition` y lifecycle fiscal.
3. Reconciliar migración con `(tenant_id, cuit)` único y referencias same-tenant.
4. Definir estrategia de referencia segura para certificados y claves.
5. Especificar la relación con FiscalPoint y consumo desde Branch.
6. Definir `FiscalEntityRepository` tenant-safe y mapping camelCase ↔ snake_case.
7. Registrar cambios fiscales relevantes mediante auditoría y outbox cuando aplique.
8. Añadir tests de CUIT, lifecycle, rotación segura y Tenant A/B.

La integración con ARCA y los endpoints HTTP se implementan después desde sus specs correspondientes.

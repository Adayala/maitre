# Plan — SPEC-002

1. Aprobar el agregado Brand y su separación respecto de Menu, Branch, FiscalEntity y Entitlements.
2. Congelar el set de defaults permitidos y descartar `config` abierto en I0.
3. Reconciliar la migración `brands` con constraints de unicidad por Tenant y lifecycle.
4. Definir value objects de `name`, `slug` y referencias same-tenant.
5. Establecer reglas de override entre Brand y Branch sin implementación implícita.
6. Definir `BrandRepository` tenant-safe y mapping camelCase ↔ snake_case.
7. Registrar `BrandCreated` y mutaciones relevantes mediante transactional outbox.
8. Añadir tests de slug, lifecycle, herencia explícita y aislamiento Tenant A/B.

Los endpoints HTTP y la experiencia CRUD se implementan después desde la spec API correspondiente.

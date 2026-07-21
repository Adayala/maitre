# Plan — SPEC-004

1. Aprobar el agregado mínimo y la exclusión de services/config/menu.
2. Reconciliar constraints necesarias en Brand y FiscalEntity.
3. Definir migración con relaciones compuestas same-tenant y rollback.
4. Implementar Branch, Address y validadores puros.
5. Implementar `BranchRepository` con tenant context obligatorio.
6. Implementar casos de uso de creación y transición de estado.
7. Registrar `BranchCreated` mediante transactional outbox.
8. Añadir tests de referencias cross-tenant, estados, mapping y timezone.

Los endpoints se implementan desde la spec API correspondiente después de aprobar este contrato.

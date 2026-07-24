# Rules — SPEC-003

- **FIS-001:** FiscalEntity siempre pertenece a exactamente un Tenant.
- **FIS-002:** `(tenantId, cuit)` es único dentro del Tenant.
- **FIS-003:** `cuit` se valida por formato y checksum antes de persistir.
- **FIS-004:** `taxCondition` pertenece a un catálogo aprobado; no acepta strings libres.
- **FIS-005:** la clave privada nunca se expone ni se persiste en texto plano en tablas operativas.
- **FIS-006:** sólo puede existir un certificado activo referenciado por vez.
- **FIS-007:** `ACTIVE ↔ INACTIVE`; `ACTIVE|INACTIVE → ARCHIVED`; `ARCHIVED` es terminal.
- **FIS-008:** Branch y recursos descendientes sólo usan FiscalEntities same-tenant.
- **FIS-009:** cambios de certificado preservan historial y auditoría.
- **FIS-010:** timestamps son server-side, `timestamptz` y UTC.

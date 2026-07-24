# Rules — SPEC-002

- **BRA-001:** Brand siempre pertenece a exactamente un tenant.
- **BRA-002:** `slug` es único por tenant, no global.
- **BRA-003:** `slug` se normaliza antes de validar y no se resuelve por heurísticas ambiguas.
- **BRA-004:** Brand no usa `config` JSON abierto para esconder decisiones de dominio.
- **BRA-005:** Branch sólo hereda defaults declarados explícitamente por contrato.
- **BRA-006:** Brand no persiste menú completo, certificados fiscales, límites ni entitlements.
- **BRA-007:** `ACTIVE ↔ INACTIVE`; `ACTIVE|INACTIVE → ARCHIVED`; `ARCHIVED` es terminal.
- **BRA-008:** `ARCHIVED` es sólo lectura para mutaciones operativas nuevas.
- **BRA-009:** referencias same-tenant se validan en aplicación y DB cuando existan FKs compuestas.
- **BRA-010:** API camelCase y DB snake_case se conectan mediante repository/mappers.
- **BRA-011:** timestamps son server-side, `timestamptz` y UTC.
- **BRA-012:** eventos y agregado se persisten atómicamente mediante outbox.

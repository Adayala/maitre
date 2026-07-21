# Rules — SPEC-004

- **BRA-001:** `(tenantId, code)` es único y code se normaliza antes de validar.
- **BRA-002:** `tenantId` no cambia después de crear Branch.
- **BRA-003:** Brand pertenece al mismo Tenant y admite nuevas branches.
- **BRA-004:** FiscalEntity, cuando existe, pertenece al mismo Tenant.
- **BRA-005:** referencias cross-tenant fallan tanto en aplicación como en constraints de DB.
- **BRA-006:** timezone es IANA; offsets fijos no son válidos.
- **BRA-007:** `INACTIVE` bloquea comandos operativos nuevos.
- **BRA-008:** `ARCHIVED` es terminal y de sólo lectura.
- **BRA-009:** Branch no persiste servicios, features, cuotas ni límites.
- **BRA-010:** Branch no usa JSON genérico para configuración o herencia.
- **BRA-011:** dirección parcial es inválida si falta line1, city o countryCode.
- **BRA-012:** habilitación efectiva requiere Tenant/Branch activos, autorización y entitlements.
- **BRA-013:** `BranchCreated` se registra atómicamente mediante outbox.
- **BRA-014:** API camelCase y DB snake_case se conectan mediante repository/mappers.
- **BRA-015:** timestamps son server-side, `timestamptz` y UTC.

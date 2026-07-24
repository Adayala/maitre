# Rules — SPEC-005

- **SAL-001:** Salon siempre pertenece a exactamente una Branch y un Tenant.
- **SAL-002:** `(tenantId, branchId, name)` es único salvo decisión explícita distinta.
- **SAL-003:** `capacity`, si existe, debe ser positiva y su semántica debe estar aprobada.
- **SAL-004:** Salon no persiste estados derivados de ocupación, pago o limpieza.
- **SAL-005:** Table sólo puede referenciar salones same-tenant y same-branch.
- **SAL-006:** `ACTIVE ↔ INACTIVE`; `ACTIVE|INACTIVE → ARCHIVED`; `ARCHIVED` es terminal si se aprueba.
- **SAL-007:** timestamps son server-side, `timestamptz` y UTC.

# Rules — SPEC-006

- **TAB-001:** Table siempre pertenece a exactamente un Tenant, Branch y Salon coherentes.
- **TAB-002:** `(tenantId, salonId, number)` es único salvo decisión explícita distinta.
- **TAB-003:** `capacity` debe ser positiva.
- **TAB-004:** el estado operativo visible es derivado; no se persiste como source of truth.
- **TAB-005:** sólo puede existir override administrativo explícito para bloqueo u otra excepción aprobada.
- **TAB-006:** la precedencia de estados derivados debe estar documentada y ser determinística.
- **TAB-007:** atributos físicos y de layout no se modelan como blob abierto.
- **TAB-008:** timestamps son server-side, `timestamptz` y UTC.

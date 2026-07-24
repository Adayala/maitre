# Verificación — SPEC-008

## Criterios

### CAD-008-01 — Create/list/get/PATCH derivan `tenantId` del contexto autenticado y nunca aceptan autoridad tenant desde body/query

- [ ] body y query no pueden elevar autoridad tenant;
- [ ] create/list/get/patch usan siempre contexto autenticado server-side;
- [ ] acceso cross-tenant falla cerrado.

### CAD-008-02 — Create es idempotente; la misma key con distinto payload falla y no duplica Brand ni evento lógico

- [ ] misma idempotency key + mismo payload devuelve el mismo resultado lógico;
- [ ] misma key + payload distinto produce conflicto;
- [ ] no se duplican Brand ni evento lógico de creación.

### CAD-008-03 — Slug/nombre normalizados respetan unicidad definida por tenant y producen conflictos deterministas

- [ ] normalización de nombre/slug es determinística;
- [ ] duplicados dentro del Tenant fallan con conflicto consistente;
- [ ] el mismo slug puede existir en tenants distintos si el contrato lo permite.

### CAD-008-04 — List usa cursor opaco, filtros permitidos y orden estable sin revelar marcas cross-tenant

- [ ] paginación usa cursor opaco;
- [ ] el orden es estable entre páginas;
- [ ] filtros sólo aceptan campos aprobados;
- [ ] no revela marcas de otros tenants.

### CAD-008-05 — PATCH exige `If-Match`; inactivación preserva historia y se rechaza si rompe branches o publicaciones activas

- [ ] `PATCH` exige `If-Match`;
- [ ] inactivación/archivo preservan historia;
- [ ] cambios incompatibles con relaciones activas fallan de forma explícita.

### CAD-008-06 — OpenAPI, Problem Details, permisos y auditoría cubren normalización, paginación, concurrencia y aislamiento

- [ ] OpenAPI refleja body, filtros y respuestas aprobadas;
- [ ] Problem Details cubre conflicto, concurrencia y validación;
- [ ] auditoría y permisos quedan enlazados con pruebas contractuales.

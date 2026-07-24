# Verificación — SPEC-004

## Criterios

### CAD-004-01 — Branch modela una unidad operativa con alcance tenant

- [ ] Branch requiere `tenantId`, `brandId`, `code`, `name`, `status` y `timezone` válidos;
- [ ] el agregado no contiene services, features, config genérica ni menu ID;
- [ ] consultas devuelven sólo sucursales del tenant autorizado.

### CAD-004-02 — Brand y FiscalEntity deben pertenecer al mismo tenant

- [ ] Brand de otro tenant falla en aplicación y DB;
- [ ] FiscalEntity de otro tenant falla en aplicación y DB;
- [ ] constraints compuestas funcionan en migración y rollback;
- [ ] cambiar `tenantId` está prohibido.

### CAD-004-03 — `code` es estable, normalizado y único dentro del Tenant

- [ ] `code` se normaliza y valida;
- [ ] duplicado dentro del Tenant falla;
- [ ] el mismo `code` puede existir en tenants distintos;
- [ ] Branch no cambia de tenant después de creada.

### CAD-004-04 — Ubicación y timezone se modelan explícitamente

- [ ] timezone inválida falla;
- [ ] dirección parcial falla;
- [ ] API camelCase mapea a DB snake_case sin pérdida;
- [ ] timestamps son `timestamptz` y UTC.

### CAD-004-05 — Branch no absorbe capacidades, menús ni entitlements

- [ ] el cálculo de capacidades consulta Entitlement sin escribirlas en Branch;
- [ ] menús, horarios y políticas heredables no se persisten ad hoc dentro del agregado;
- [ ] claims del proveedor no sustituyen autorización ni alcance persistido.

### CAD-004-06 — Lifecycle, aislamiento y eventos de Branch son consistentes

- [ ] sólo se permiten transiciones declaradas;
- [ ] `ARCHIVED` no retorna a estados operativos;
- [ ] User de Tenant A no lista, lee ni modifica Branch de Tenant B;
- [ ] Tenant o Branch no operativos bloquean comandos;
- [ ] `BranchCreated` y Branch se persisten atómicamente;
- [ ] existe evidencia enlazada de tests, migraciones y review.

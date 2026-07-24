# Verificación — SPEC-011

## Criterios

### CAD-011-01 — Create/list bajo Branch resuelven tenant/sucursal desde path y contexto; un alcance cross-tenant no crea, lista ni revela salones

- [ ] create/list resuelven tenant/sucursal desde contexto y path aprobados;
- [ ] alcance cross-tenant no crea ni revela recursos;
- [ ] lecturas fuera de alcance fallan cerrado.

### CAD-011-02 — El nombre normalizado es único case-insensitive dentro de Branch y los conflictos son deterministas

- [ ] nombre se normaliza de forma determinística;
- [ ] unicidad case-insensitive se aplica por Branch;
- [ ] conflictos se presentan de forma consistente.

### CAD-011-03 — `maxCapacity` es entero positivo administrativo y no se recalcula desde una proyección eventual de mesas

- [ ] `maxCapacity` sólo acepta enteros positivos válidos;
- [ ] la API no recalcula capacidad desde proyecciones eventuales;
- [ ] se distingue claramente capacidad administrativa de derivaciones operativas.

### CAD-011-04 — Reducir capacidad o inactivar se rechaza cuando contradice configuración u operación activa; no existe eliminación física

- [ ] reducción incompatible falla;
- [ ] inactivación incompatible con operación/configuración activa falla;
- [ ] no existe eliminación física como camino normal.

### CAD-011-05 — PATCH requiere `If-Match`; list tiene paginación/orden estable y no expande Table ni presenta conteos derivados como autoridad

- [ ] `PATCH` exige `If-Match`;
- [ ] list usa paginación y orden estable;
- [ ] la respuesta no usa conteos derivados como fuente de verdad.

### CAD-011-06 — Problem Details, permisos, auditoría y OpenAPI cubren unicidad, capacidad, concurrencia, ciclo de vida y aislamiento

- [ ] Problem Details cubre validación, conflicto y concurrencia;
- [ ] permisos y auditoría quedan explicitados;
- [ ] existen pruebas contractuales enlazadas para unicidad, ciclo de vida y aislamiento.

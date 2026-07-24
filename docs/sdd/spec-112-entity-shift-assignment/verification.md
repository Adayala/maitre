# Verificación — SPEC-112

## Criterios

### CAD-112-01 — ShiftAssignment pertenece a un Shift válido y a un actor del mismo tenant/sucursal

- [ ] refs inválidas o cross-tenant/cross-sucursal fallan;
- [ ] el Shift referenciado debe estar en estado compatible;
- [ ] el actor pertenece al alcance operativo autorizado.

### CAD-112-02 — El alcance operativo del assignment es explícito y no reemplaza RBAC global

- [ ] el alcance operativo se valida contra catálogo/policy aprobados;
- [ ] el assignment no concede RBAC global;
- [ ] la autoridad sigue dependiendo de Membership/RBAC más alcance operativo.

### CAD-112-03 — La unicidad y superposición de assignments siguen una policy declarada

- [ ] assignments simultáneos incompatibles fallan o convergen según policy;
- [ ] ausencia de policy explícita falla cerrado;
- [ ] la unicidad/superposición es determinista.

### CAD-112-04 — Activar, mover o cerrar assignments conserva historia y no reescribe ventanas cerradas

- [ ] los intervalos cerrados no se reescriben;
- [ ] mover o cerrar conserva historia auditable;
- [ ] los cambios no borran evidencia previa.

### CAD-112-05 — Los comandos sobre assignments usan concurrencia explícita, idempotencia y auditoría

- [ ] retries no duplican assignments;
- [ ] conflictos de revisión fallan explícitamente;
- [ ] create/reassign/close quedan auditados.

### CAD-112-06 — La aprobación exige fixtures de superposición, retries, close de Shift y aislamiento operativo

- [ ] overlaps y retries tienen fixtures deterministas;
- [ ] close de Shift interactúa correctamente con assignments activos;
- [ ] aislamiento tenant/sucursal/alcance queda verificado.

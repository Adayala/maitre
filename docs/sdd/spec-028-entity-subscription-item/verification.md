# Verificación — SPEC-028

## Criterios

### CAD-028-01 — Cada item referencia `serviceCode + catalogVersion` existente y pertenece a la Subscription/Tenant correctos

- [ ] serviceCode/catalogVersion desconocidos fallan cerrado;
- [ ] el item pertenece a la Subscription y Tenant correctos;
- [ ] referencias inconsistentes se rechazan.

### CAD-028-02 — Quantity es positiva, los alcances por sucursal pertenecen al Tenant y config cumple el schema del servicio

- [ ] alcance por sucursal cross-tenant se rechaza;
- [ ] quantity inválida se rechaza;
- [ ] config desconocida o inválida falla contra el schema del servicio.

### CAD-028-03 — No existen dos items activos para la misma combinación service/alcance

- [ ] duplicado activo por service/alcance se rechaza;
- [ ] la unicidad se mantiene bajo concurrencia;
- [ ] el mismo servicio sólo coexistie si el scope aprobado lo permite.

### CAD-028-04 — Activar/modificar/desactivar usa lifecycle, vigencia, concurrencia y auditoría; no existe eliminación de uso histórico

- [ ] vigencia/lifecycle inválidos se rechazan;
- [ ] cambios stale fallan con control de concurrencia;
- [ ] no existe eliminación del uso histórico.

### CAD-028-05 — Cambios recalculan Entitlements de forma determinista y una reducción incompatible entra en remediation, no borra datos

- [ ] reducción incompatible no borra uso;
- [ ] recomputación se dispara de forma determinista;
- [ ] remediation queda trazada y auditable.

### CAD-028-06 — Precio/billing no decide autorización y queda fuera de este contrato mientras no exista catálogo comercial aprobado

- [ ] precio o billing no deciden autorización;
- [ ] no se filtran términos comerciales no aprobados;
- [ ] auditoría preserva historia sin side effects comerciales.

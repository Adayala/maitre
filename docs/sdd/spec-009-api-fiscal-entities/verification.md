# Verificación — SPEC-009

## Criterios

### CAD-009-01 — Create/list/get/PATCH sólo operan sobre FiscalEntities accesibles por contexto tenant y ocultan recursos cross-tenant como `404`

- [ ] todas las operaciones usan contexto tenant autorizado;
- [ ] recursos cross-tenant o inexistentes se ocultan como `404`;
- [ ] el acceso no depende de IDs visibles aportados por el cliente.

### CAD-009-02 — Tax ID se normaliza/valida y su unicidad produce un conflicto determinista sin exponer el valor de otro tenant

- [ ] tax ID válido se normaliza de forma determinística;
- [ ] tax ID inválido o duplicado falla con error explícito;
- [ ] el conflicto no expone valores de otro tenant.

### CAD-009-03 — Datos legales se minimizan o redactan por permiso; secretos/certificados nunca aparecen en responses, logs ni auditoría

- [ ] responses sólo devuelven campos permitidos por permiso;
- [ ] secretos, claves y certificados no aparecen en response ni logs;
- [ ] auditoría conserva diff sanitizado.

### CAD-009-04 — Create es idempotente y PATCH exige `If-Match`; cambios sensibles registran actor, motivo y diff sanitizado

- [ ] create usa idempotencia consistente;
- [ ] `PATCH` exige `If-Match`;
- [ ] cambios sensibles registran actor, motivo y diff sin datos secretos.

### CAD-009-05 — No existe hard delete ni mutación retroactiva de snapshots usados por invoices; relaciones activas bloquean cambios incompatibles

- [ ] no existe hard delete para entidades fiscales activamente referenciadas;
- [ ] snapshots fiscales usados por comprobantes no cambian retroactivamente;
- [ ] relaciones activas bloquean mutaciones incompatibles.

### CAD-009-06 — OpenAPI, Problem Details y pruebas contractuales cubren validación fiscal, redacción, RBAC, uso por sucursal, concurrencia y aislamiento

- [ ] OpenAPI refleja redacción y bodies aprobados;
- [ ] Problem Details cubre validación fiscal, conflicto y concurrencia;
- [ ] existen pruebas contractuales enlazadas para RBAC, uso por sucursal y aislamiento.

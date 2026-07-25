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

### CAD-009-04 — Create es idempotente y PATCH exige `If-Match`; cambios sensibles registran actor, motivo, step-up y diff sanitizado

- [ ] create soporta reintento idempotente con `Idempotency-Key` o estrategia equivalente aprobada;
- [ ] `PATCH` exige `If-Match`;
- [ ] cambios sensibles exigen `reason` y step-up reciente;
- [ ] cambios sensibles registran actor, motivo y diff sin datos secretos.

### CAD-009-05 — No existe hard delete ni mutación retroactiva de snapshots usados por invoices; relaciones activas bloquean cambios incompatibles

- [ ] no existe hard delete para entidades fiscales activamente referenciadas;
- [ ] snapshots fiscales usados por comprobantes no cambian retroactivamente;
- [ ] relaciones activas bloquean mutaciones incompatibles.

### CAD-009-06 — OpenAPI, Problem Details y pruebas contractuales cubren validación fiscal, redacción, RBAC, uso por sucursal, concurrencia y aislamiento

- [ ] OpenAPI refleja redacción y bodies aprobados;
- [ ] Problem Details cubre validación fiscal, conflicto y concurrencia;
- [ ] existen pruebas contractuales enlazadas para RBAC, uso por sucursal y aislamiento.

### CAD-009-08 — Create emite outbox mínimo y create/update escriben audit logs sanitizados

- [ ] `FiscalEntityCreated` omite CUIT, direcciones, activityCode y secret refs;
- [ ] create/update escriben audit log tenant-scoped;
- [ ] auditoría usa snapshots sanitizados (por ejemplo CUIT enmascarado y flags de presencia).

### CAD-009-07 — El contrato HTTP queda reconciliado con SPEC-003 y usa el vocabulario fiscal autoritativo del dominio

- [ ] la API usa `taxCondition` como campo autoritativo y no mezcla `regime` divergente;
- [ ] `name` se documenta como razón social/alias de `legalName` mientras no exista split de campos;
- [ ] `legalAddress`, `fiscalAddress` y `activityCode` quedan definidos como opcionales en I0;
- [ ] la validación AFIP/ARCA de catálogos o actividad queda marcada como integración diferida.

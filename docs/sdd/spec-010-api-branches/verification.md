# Verificación — SPEC-010

## Criterios

### CAD-010-01 — Create deriva tenant del contexto y rechaza Brand/FiscalEntity inexistentes, de otro tenant o incompatibles

- [ ] create usa contexto autenticado para resolver tenant;
- [ ] referencias inexistentes, de otro tenant o incompatibles fallan;
- [ ] no se crean sucursales parciales.

### CAD-010-02 — Nombre, timezone IANA, dirección estructurada y contacto cumplen validaciones canónicas; cuota agotada produce conflicto sin creación parcial

- [ ] nombre, timezone, dirección y contacto validan según contrato;
- [ ] cuota agotada produce conflicto explícito;
- [ ] una falla no deja efectos parciales.

### CAD-010-03 — Reintentar Create con misma key/payload devuelve la misma sucursal; distinto payload devuelve conflicto

- [ ] create es idempotente por key y payload;
- [ ] payload distinto con misma key produce conflicto;
- [ ] no se duplican sucursal ni evento lógico.

### CAD-010-04 — List/get usan alcance tenant/sucursal, cursor opaco y orden estable, sin expansiones que dupliquen autoridad de Salon/Table

- [ ] list/get respetan alcances autorizados;
- [ ] paginación usa cursor opaco y orden estable;
- [ ] las respuestas no expanden recursos hijos como fuente de autoridad.

### CAD-010-05 — PATCH exige `If-Match`, no reasigna tenant/brand/fiscal entity silenciosamente y rechaza inactivación incompatible con operación activa

- [ ] `PATCH` exige `If-Match`;
- [ ] no permite reasignaciones silenciosas de tenant/brand/fiscal entity;
- [ ] inactivación incompatible con operación activa falla explícitamente.

### CAD-010-06 — Problem Details, permisos, auditoría sanitizada y OpenAPI cubren cuota, idempotencia, concurrencia y aislamiento

- [ ] OpenAPI refleja validaciones, body y errores aprobados;
- [ ] Problem Details cubre cuota, conflicto y concurrencia;
- [ ] auditoría y permisos quedan cubiertos con pruebas enlazadas.

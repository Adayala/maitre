# Verificación — SPEC-045

## Criterios

### CAD-045-01 — `GET /v1/audit-logs` deriva tenant/alcance server-side y requiere un permiso sensible; un rol ADMIN nominal no basta

- [ ] el endpoint deriva tenant/alcance server-side;
- [ ] requiere un permiso sensible;
- [ ] un rol ADMIN nominal no basta por sí solo.

### CAD-045-02 — Filtros actor/action/resource/rango están allowlisted y acotados; orden `occurredAt,id` y cursor evitan gaps/duplicados

- [ ] filtros allowlisted producen subset correcto;
- [ ] cursor pagination no duplica/omite bajo orden estable;
- [ ] rango/limit/filtro costoso fuera de policy falla.

### CAD-045-03 — La respuesta minimiza actor/diff/señales según permiso/clasificación y nunca expone secrets, PII o hashes internos innecesarios

- [ ] redacción cambia según permiso sin filtrar secrets/PII;
- [ ] actor/diff/señales se minimizan por clasificación;
- [ ] hashes internos innecesarios no se exponen.

### CAD-045-04 — Retention/legal hold se reflejan sin inferir que un record ausente nunca existió

- [ ] retention/legal hold se representa correctamente;
- [ ] la ausencia de un record no se interpreta como inexistencia histórica;
- [ ] la API conserva semántica de evidencia.

### CAD-045-05 — No existen create/update/delete ni export CSV síncrono; export futuro usa job, snapshot, autorización, límites y evidencia propios

- [ ] API permanece read-only;
- [ ] export síncrono no existe;
- [ ] futuros exports requieren contrato separado.

### CAD-045-06 — Conditional pagination, redacción, filtros costosos, soporte cross-tenant y anti-enumeration poseen outcomes verificables

- [ ] soporte cross-tenant no autorizado falla sin enumeración;
- [ ] conditional pagination y filtros costosos poseen evidencia;
- [ ] anti-enumeration y redacción quedan verificadas.

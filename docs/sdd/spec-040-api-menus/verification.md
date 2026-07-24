# Verificación — SPEC-040

## Criterios

### CAD-040-01 — Create/list/get derivan tenant del contexto y validan Brand/alcances sin revelar recursos de otro tenant

- [ ] create/list/get derivan tenant del contexto;
- [ ] Brand/alcances inválidos o de otro tenant fallan;
- [ ] recursos fuera de alcance no se revelan.

### CAD-040-02 — Create produce DRAFT idempotente con currency/alcances/version y no publica contenido parcial

- [ ] create retry no duplica DRAFT;
- [ ] currency/alcances/version quedan inicializados correctamente;
- [ ] create no publica contenido parcial.

### CAD-040-03 — PATCH exige `If-Match` y sólo modifica DRAFT; PUBLISHED permanece inmutable

- [ ] PATCH con revisión desactualizada o sobre publicado falla;
- [ ] PATCH exige `If-Match`;
- [ ] PUBLISHED permanece inmutable.

### CAD-040-04 — Publish valida snapshot completo, es idempotente y mueve el puntero activo atómicamente; error deja el puntero anterior

- [ ] invalid snapshot no mueve el puntero;
- [ ] double publish es idempotente;
- [ ] publicación válida congela snapshot/puntero.

### CAD-040-05 — Archive es command auditado, conserva revisiones/orders y no existe eliminación física

- [ ] archive conserva revisiones/orders;
- [ ] archive queda auditado;
- [ ] no existe eliminación física.

### CAD-040-06 — Cursor/filtros/orden, 404/409/412/422, RBAC, auditoría y OpenAPI poseen evidencia de alcances, doble publish y concurrencia

- [ ] alcances de otro tenant y permisos insuficientes fallan;
- [ ] errors/ETag/OpenAPI coinciden con contrato;
- [ ] cursor/filtros/orden y concurrencia poseen evidencia.

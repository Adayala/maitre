# Tasks — SPEC-118

- [ ] Aprobar `CAD-118-01..06`.
- [ ] Resolver owner, reviewer, prioridad y blockers.
- [ ] Congelar payloads, headers y invariants de pausa abierta.
- [ ] Congelar findings/adjustments y self-vs-supervisor scopes.
- [ ] Congelar matriz de lecturas de CAD-118-05:
  - self-access: `GET /time-entries/:id/breaks`, `GET /breaks/:id`, `GET /breaks/:id/adjustments`,
    `GET /break-adjustments/:id` sólo sobre recursos propios y con redaction de terceros;
  - supervisor access: mismas lecturas más `GET /branches/:branchId/breaks`, con scope de
    sucursal/Employment y payload completo.
- [ ] Definir fixtures de retry offline, clock-out con pausa y concurrencia.
- [ ] Autorizar materialización sólo después del cierre de especificación.

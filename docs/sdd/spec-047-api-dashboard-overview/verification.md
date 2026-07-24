# Verificación — SPEC-047

## Criterios

### CAD-047-01 — `GET /v1/dashboard/overview` deriva tenant/alcance de sucursal y filtra secciones por permiso

- [ ] permiso/alcance de sucursal y aislamiento entre tenants filtran correctamente;
- [ ] tenant/alcance de sucursal se deriva server-side;
- [ ] las secciones se filtran por permiso.

### CAD-047-02 — Cada sección declara status `AVAILABLE | PARTIAL | UNAVAILABLE`, asOf, freshness, revisión de fuente y métricas con definición referenciada

- [ ] `metricCode` y valores provienen de fuentes/definiciones declaradas;
- [ ] asOf/freshness/revisión corresponden a la fuente;
- [ ] cada sección declara status y metadata de freshness.

### CAD-047-03 — Dependencia fallida/timeout no produce cero; devuelve estado/motivo explícitos por sección y conserva otras secciones

- [ ] timeout/failure produce sección unavailable, no cero;
- [ ] otra sección disponible sobrevive a respuesta partial;
- [ ] status/motivo explícitos se devuelven por sección.

### CAD-047-04 — Ventanas como “24h” sólo se usan cuando metric definition/timezone/cutoff están versionados; overview no inventa KPIs ad hoc

- [ ] ventanas temporales siguen definiciones versionadas;
- [ ] timezone/cutoff forman parte de la definición;
- [ ] no se inventan KPIs ad hoc.

### CAD-047-05 — Composición respeta budget, evita N+1, minimiza PII y usa cache/ETag con desactualización visible

- [ ] cache desactualizada es visible y ETag reproducible;
- [ ] budget excedido termina de forma acotada;
- [ ] la respuesta no contiene PII innecesaria.

### CAD-047-06 — Partial/stale/timeout/cache/alcance y aislamiento entre tenants poseen resultados verificables conforme a SPEC-216

- [ ] partial/stale/timeout/cache siguen resultados verificables;
- [ ] alcance y aislamiento entre tenants siguen contrato;
- [ ] SPEC-216 queda referenciada por evidencia.

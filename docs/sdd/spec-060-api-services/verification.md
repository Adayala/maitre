# Verificación — SPEC-060

## Criterios

### CAD-060-01 — La API de ServicePeriod delimita rutas, comandos y revisiones explícitas

- [ ] OpenAPI contiene sólo superficie, schemas y permisos aprobados.

### CAD-060-02 — Timezone y businessDate se derivan de forma determinista

- [ ] DST, medianoche y timezone derivan businessDate correcto o error estable.

### CAD-060-03 — La apertura concurrente respeta política de solapamiento por Branch

- [ ] open concurrente respeta policy y produce un único ganador cuando aplica.

### CAD-060-04 — El cierre declara blockers sin filtrar datos sensibles

- [ ] begin-close bloquea nuevas Visits y close informa todos los blockers sin PII.

### CAD-060-05 — Timeout y force-close conservan límites de autoridad

- [ ] timeout conserva CLOSING y force-close audita sin mutar dependencias.

### CAD-060-06 — La aprobación exige evidencia temporal, de RBAC y aislamiento

- [ ] retries, revisión, RBAC, Problem Details, outbox y aislamiento fallan cerrado.

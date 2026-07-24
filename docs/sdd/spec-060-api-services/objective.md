# Objetivo — SPEC-060

Definir la frontera HTTP para planificar y operar ServicePeriod por Branch y businessDate,
incluido un cierre seguro que no falsifique el estado de sus dependencias.

## Criterios de aceptación

### CAD-060-01 — La API de ServicePeriod delimita rutas, comandos y revisiones explícitas

create/list/detail y cinco comandos tienen rutas, schemas, permisos y revisiones
explícitos.

### CAD-060-02 — Timezone y businessDate se derivan de forma determinista

timezone y businessDate se derivan con Branch/política; entradas locales ambiguas o
inexistentes por DST se resuelven o rechazan determinísticamente.

### CAD-060-03 — La apertura concurrente respeta política de solapamiento por Branch

open aplica solapamiento y serializa aperturas concurrentes por Branch.

### CAD-060-04 — El cierre declara blockers sin filtrar datos sensibles

begin-close bloquea nuevas Visits y close devuelve blockers tipados, acotados y no
sensibles.

### CAD-060-05 — Timeout y force-close conservan límites de autoridad

timeout conserva CLOSING; force-close exige manager/reason y genera findings sin mutar
dependencias.

### CAD-060-06 — La aprobación exige evidencia temporal, de RBAC y aislamiento

La aprobación exige fixtures de idempotencia, revisión, DST, carreras, RBAC, auditoría,
outbox y aislamiento.

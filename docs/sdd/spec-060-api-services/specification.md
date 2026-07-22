# Especificación — SPEC-060 ServicePeriods API

Create/list/detail y commands `open`, `begin-close`, `close`, `force-close`, `cancel-planned`.
Business date/timezone se derivan de Branch; `If-Match` e idempotency aplican.

Open valida ServicePeriodPolicy/overlap. Begin-close bloquea nuevas Visits. Close devuelve blockers
tipados (visits, checks, payments, cash sessions). Timeout mantiene CLOSING y escala; force-close
registra reason/findings sin falsificar cierres dependientes.

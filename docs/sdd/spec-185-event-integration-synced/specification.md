# Especificación — SPEC-185 IntegrationSyncCompleted

`integrations.sync.completed.v1` se emite por run terminal SUCCESS|PARTIAL|FAILED. Envelope SPEC-217
+ integration/run IDs, direction/resources, original/new checkpoint versions cuando promovido,
counts, duration y outcome. Omite cursors raw, payloads, external IDs y secrets.

Retry es otro run/correlation; el mismo terminal transition no reemite. Consumidores no interpretan
PARTIAL como éxito completo.

El evento comunica el resultado operacional del run, no el éxito de negocio de cada item individual.
Para eso expone counts y outcome terminal, manteniendo detalle fino en consultas o logs auditados. La
presencia de `PARTIAL` obliga a los consumidores a tratar el resultado como incompleto y potencialmente
reintetable.

Las versiones de checkpoint son suficientes para invalidar caches y disparar reconsulta de estado, sin
exponer cursores o payloads sensibles. La identidad lógica del evento incluye `syncRunId`,
`terminalOutcome` y `runRevision`.

# Especificación — SPEC-185 IntegrationSyncCompleted

`integrations.sync.completed.v1` se emite por run terminal SUCCESS|PARTIAL|FAILED. Envelope SPEC-217
+ integration/run IDs, direction/resources, original/new checkpoint versions cuando promovido,
counts, duration y outcome. Omite cursors raw, payloads, external IDs y secrets.

Retry es otro run/correlation; el mismo terminal transition no reemite. Consumidores no interpretan
PARTIAL como éxito completo.

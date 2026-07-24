# Especificación — SPEC-175 SyncRun, Checkpoint y SyncLog

SyncCheckpoint es autoridad por integration+resource+direction+partition: current cursor/version,
lease owner/expiry y updatedAt. SyncRun congela original cursor, candidate cursor, mode, policy,
counts/outcome y correlation.

Lease impide runs incompatibles. Candidate cursor se promueve atómicamente sólo tras persistir todos
los writes del boundary confirmado; partial conserva checkpoint anterior o sub-checkpoints
explícitos. SyncLog es evidencia append-only/redactada y no coordina ejecución.

La entidad `SyncCheckpoint` incluye `checkpointId`, `integrationId`, `resource`, `direction`,
`partitionKey`, `currentCursor`, `currentVersion?`, `leaseOwner?`, `leaseExpiresAt?`, `updatedAt` y
`revision`. `SyncRun` incluye `syncRunId`, `checkpointRef`, `originalCursor`, `candidateCursor`,
`mode`, `policyVersion`, `counts`, `outcome`, `correlationId`, `startedAt`, `finishedAt?` y
`revision`.

`SyncLog` registra mensajes, warnings, errores y evidencia redactada asociados al run, pero no es la
autoridad del cursor ni del lease. La coordinación depende del checkpoint y del run activo, no de la
secuencia de logs. Esto evita que observabilidad y control de ejecución se contaminen mutuamente.

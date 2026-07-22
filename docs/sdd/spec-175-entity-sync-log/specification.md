# Especificación — SPEC-175 SyncRun, Checkpoint y SyncLog

SyncCheckpoint es autoridad por integration+resource+direction+partition: current cursor/version,
lease owner/expiry y updatedAt. SyncRun congela original cursor, candidate cursor, mode, policy,
counts/outcome y correlation.

Lease impide runs incompatibles. Candidate cursor se promueve atómicamente sólo tras persistir todos
los writes del boundary confirmado; partial conserva checkpoint anterior o sub-checkpoints
explícitos. SyncLog es evidencia append-only/redactada y no coordina ejecución.

# Contrato de entidad — SPEC-175 Sync Log

SyncCheckpoint es autoridad transaccional de cursor/lease por partition; SyncRun congela cursor
original/candidate y outcome. SyncLog es sólo evidencia append-only, sin payloads ni secrets. El
checkpoint avanza únicamente después de persistencia confirmada. Tests cubren partial, lease,
crash/retry, cursor corrupto, redacción y aislamiento.

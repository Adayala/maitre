# Reglas — SPEC-175

- Checkpoint es la autoridad de cursor por partición.
- Lease impide runs incompatibles.
- Candidate cursor sólo se promueve atómicamente tras writes confirmados.
- Partial failures preservan checkpoint o usan sub-checkpoints explícitos.
- SyncLog es evidencia append-only y no coordina ejecución.

# Reglas — SPEC-184

- OwnershipMatrix es obligatoria por recurso y campo.
- Sólo hay authority única salvo merge determinista explícito.
- No existe last-write-wins implícito.
- External IDs no se reutilizan.
- Replay/backfill/out-of-order deben converger por versión/checkpoint.

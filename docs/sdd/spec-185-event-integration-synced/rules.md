# Reglas — SPEC-185

- Nombre canónico: `integrations.sync.completed.v1`.
- Sólo se emite por transiciones terminales del run.
- Payload omite cursores raw, payloads, external IDs y secrets.
- Retry genera otro run/correlation.
- `PARTIAL` nunca equivale a éxito completo.

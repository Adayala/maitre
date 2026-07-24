# Verificación — SPEC-104

## Criterios

### CAD-104-01 — La API de Production define cola, cursor, revisión y `asOf`

- [ ] payload de cola declara revisión, cursor y `asOf` consistentemente.

### CAD-104-02 — La API separa lectura de proyección y mutación autoritativa

- [ ] lectura y mutación permanecen separadas entre proyección y Commands API.

### CAD-104-03 — Freshness degradada se declara sin inventar estado

- [ ] freshness degradada se comunica sin habilitar escrituras ciegas.

### CAD-104-04 — Claim, hold/resume y ready/handoff tienen semántica estable

- [ ] claim/hold/resume/ready/handoff siguen semántica estable y concurrente.

### CAD-104-05 — La cola desactualizada nunca reemplaza validación autoritativa

- [ ] una cola desactualizada nunca reemplaza validación contra `Command` autoritativo.

### CAD-104-06 — La aprobación exige evidencia de reorder, múltiples operadores y repriority

- [ ] fixtures cubren lag, múltiples operadores, prioridades y cruces de alcance.

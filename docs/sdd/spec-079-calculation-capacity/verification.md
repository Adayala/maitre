# Verificación — SPEC-079

## Criterios

### CAD-079-01 — El snapshot de entrada conserva tiempo, topology y revisiones completas

- [ ] snapshots incompletos/incoherentes fallan cerrado.

### CAD-079-02 — Intervalos, buffers y combinaciones tienen semántica matemática explícita

- [ ] boundaries, buffers, expiry y overlap reproducen golden results.

### CAD-079-03 — Ranking y desempates son estables para iguales inputs

- [ ] permutations de input conservan ranking/desempate canónico.

### CAD-079-04 — El output es puro, explicable y libre de PII

- [ ] output/freshness/reasons son completos, puros y sin PII.

### CAD-079-05 — Los límites de complejidad fallan explícitamente sin resultados engañosos

- [ ] cada límite produce CALCULATION_LIMIT sin resultado engañoso.

### CAD-079-06 — La aprobación exige evidencia determinista de DST, topology y concurrencia

- [ ] DST, topology, stale y confirm races poseen evidencia determinista.

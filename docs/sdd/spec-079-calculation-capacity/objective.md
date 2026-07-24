# Objetivo — SPEC-079

Definir un cálculo puro, determinista y explicable de combinaciones y slots disponibles.

## Criterios de aceptación

### CAD-079-01 — El snapshot de entrada conserva tiempo, topology y revisiones completas

input snapshot contiene `asOf`, calendario, topology/capacity, demanda, intervalos
ocupantes y policy revisions completas.

### CAD-079-02 — Intervalos, buffers y combinaciones tienen semántica matemática explícita

intervalos, buffers, expiración de Holds, blocks y combinaciones poseen semántica
matemática inequívoca.

### CAD-079-03 — Ranking y desempates son estables para iguales inputs

ranking y desempates producen orden estable para iguales inputs/revisiones.

### CAD-079-04 — El output es puro, explicable y libre de PII

output declara slots/combinaciones, reasons, input revisions y freshness sin PII ni side
effects.

### CAD-079-05 — Los límites de complejidad fallan explícitamente sin resultados engañosos

límites de complejidad fallan explícitamente sin devolver disponibilidad parcial como
completa; confirm/seat siempre revalidan transaccionalmente.

### CAD-079-06 — La aprobación exige evidencia determinista de DST, topology y concurrencia

La aprobación exige golden fixtures de DST, overlap, buffers, topology, stale inputs,
límites y concurrencia.

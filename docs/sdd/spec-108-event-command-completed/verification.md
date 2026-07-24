# Verificación — SPEC-108

## Criterios

### CAD-108-01 — `command.ready` y `command.completed` quedan diferenciados y versionados

- [ ] ready y completed tienen fronteras y nombres inequívocos.

### CAD-108-02 — Ready y completed responden a transiciones monotónicas distintas

- [ ] ambas transiciones son monotónicas y no ambiguas.

### CAD-108-03 — Los payloads incluyen actor, station y revisiones suficientes

- [ ] payloads exponen actor, station, timestamps y revisiones suficientes.

### CAD-108-04 — Ninguno implica delivery al Guest ni sustituye Ordering

- [ ] eventos no implican delivery al Guest ni sustituyen Ordering.

### CAD-108-05 — Retry, rollback excepcional y reorder convergen con dedupe

- [ ] retry, rollback y reorder convergen con dedupe.

### CAD-108-06 — La aprobación exige evidencia de parcialidad, handoff y correlación

- [ ] fixtures cubren parcialidad, repeated handoff y aislamiento.

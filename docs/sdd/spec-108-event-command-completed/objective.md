# Objetivo — SPEC-108

Definir los eventos normativos de Command ready y completed con separación clara entre fin de
producción y handoff.

## Criterios de aceptación

### CAD-108-01 — `command.ready` y `command.completed` quedan diferenciados y versionados

`kitchen.command.ready.v1` y `kitchen.command.completed.v1` quedan diferenciados y
versionados con claridad.

### CAD-108-02 — Ready y completed responden a transiciones monotónicas distintas

ready y completed responden a transiciones lógicas distintas y monotónicas.

### CAD-108-03 — Los payloads incluyen actor, station y revisiones suficientes

payloads incluyen actor, station, timestamps y revisiones suficientes para downstreams
operativos.

### CAD-108-04 — Ninguno implica delivery al Guest ni sustituye Ordering

ninguno implica delivery al Guest ni reemplaza eventos de Ordering.

### CAD-108-05 — Retry, rollback excepcional y reorder convergen con dedupe

retry, rollback excepcional y reorder convergen sin duplicar cierres lógicos.

### CAD-108-06 — La aprobación exige evidencia de parcialidad, handoff y correlación

La aprobación exige fixtures de finalización parcial, handoff repetido, rollback,
correlación y aislamiento.

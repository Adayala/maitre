# Objetivo — SPEC-118

Definir la API de gestión de pausas con protocolo offline, policy laboral aplicada y correcciones
append-only separadas entre acceso propio y supervisor.

## Criterios de aceptación

### CAD-118-01 — Los comandos start/end y el flujo de ajustes quedan definidos con claridad

comandos start/end y el flujo de ajustes quedan definidos con claridad.

### CAD-118-02 — Start/end validan TimeEntry OPEN, unicidad y revisión/break ID

start/end validan TimeEntry OPEN, unicidad de pausa abierta y revisión/break ID según
corresponda.

### CAD-118-03 — Protocolo offline y findings no inventan timestamps

protocolo offline, policy findings y clasificación laboral se aplican sin inventar
timestamps.

### CAD-118-04 — Las correcciones son append-only con segregación requester/approver

correcciones son append-only y requester/approver permanecen segregados.

### CAD-118-05 — Acceso propio y acceso supervisor difieren en alcance y exposición

acceso propio y acceso supervisor difieren en alcance y exposición de datos.

### CAD-118-06 — La aprobación exige evidencia de retry offline, clock-out y ajustes

La aprobación exige fixtures de retry offline, clock-out con pausa, duración mínima,
concurrencia, ajustes y aislamiento.

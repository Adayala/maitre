# Objetivo — SPEC-098

Definir Command como unidad autoritativa de ejecución culinaria derivada de KitchenTicket, con
ciclo de vida monotónico, payload tipado e idempotencia por transición.

## Criterios de aceptación

### CAD-098-01 — Command fija identidad, alcance y relación lógica con allocation y station

identidad, alcance y relación 1:1 lógica con allocation + station routing quedan definidos
sin ambigüedad.

### CAD-098-02 — Los estados de Command y la semántica READY/COMPLETED son inequívocos

estados, transiciones válidas y semántica de READY vs COMPLETED son inequívocos.

### CAD-098-03 — El payload por `commandType` queda tipado y allowlisted

payload discriminado, límites de tamaño y allowlist por `commandType` quedan congelados
sin campos opacos peligrosos.

### CAD-098-04 — Retries técnicos y errores de negocio siguen caminos distintos

retries técnicos, duplicados y errores de negocio se distinguen sin introducir un estado
`FAILED` ambiguo.

### CAD-098-05 — Revisiones, idempotencia y actor del servidor gobiernan toda transición

expected revision, idempotency key, actor y timestamp del servidor gobiernan toda
transición.

### CAD-098-06 — La aprobación exige evidencia de duplicate command y producción parcial

La aprobación exige fixtures de duplicate command, retry técnico, cancel race, partial
production y aislamiento.

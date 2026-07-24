# Objetivo — SPEC-105

Definir la API de Kitchen Alerts para listar y operar activations deduplicadas con revisión,
escalación y resolución auditadas.

## Criterios de aceptación

### CAD-105-01 — La API define list/filter y comandos de alertas con claridad

list/filter y comandos `acknowledge`, `resolve`, `escalate` quedan definidos con claridad.

### CAD-105-02 — La creación automática pertenece al evaluador de reglas

creación automática pertenece al evaluador de reglas y no a llamadas directas del cliente.

### CAD-105-03 — Revisiones e idempotencia hacen converger ack/resolve/escalate

`If-Match`, idempotency y revision handling hacen converger carreras de ack, resolve y
escalate.

### CAD-105-04 — Dedupe y nueva activation post-resolve quedan acotados

dedupe por fingerprint + evidence window y nueva activation post-resolve quedan acotados.

### CAD-105-05 — La API no muta Commands ni reabre historia resuelta

la API no muta Commands ni reabre implícitamente historia resuelta.

### CAD-105-06 — La aprobación exige evidencia de storm, escalation y resolution

La aprobación exige fixtures de storm, expiry, escalation, ack race, resolution y
aislamiento.

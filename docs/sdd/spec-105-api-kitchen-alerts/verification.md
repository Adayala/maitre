# Verificación — SPEC-105

## Criterios

### CAD-105-01 — La API define list/filter y comandos de alertas con claridad

- [ ] la superficie list/filter/acknowledge/resolve/escalate es inequívoca.

### CAD-105-02 — La creación automática pertenece al evaluador de reglas

- [ ] la creación automática queda fuera de la superficie mutativa del cliente.

### CAD-105-03 — Revisiones e idempotencia hacen converger ack/resolve/escalate

- [ ] carreras de ack/resolve/escalate convergen por revisión e idempotencia.

### CAD-105-04 — Dedupe y nueva activation post-resolve quedan acotados

- [ ] dedupe y nueva activation post-resolve siguen reglas determinísticas.

### CAD-105-05 — La API no muta Commands ni reabre historia resuelta

- [ ] la API no muta Commands ni reabre historia implícitamente.

### CAD-105-06 — La aprobación exige evidencia de storm, escalation y resolution

- [ ] fixtures cubren tormentas, escalación, carreras y aislamiento entre tenants.

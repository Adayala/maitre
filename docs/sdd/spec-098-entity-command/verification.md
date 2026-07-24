# Verificación — SPEC-098

## Criterios

### CAD-098-01 — Command fija identidad, alcance y relación lógica con allocation y station

- [ ] identidad/alcance y vínculo allocation+station permanecen estables y únicos.

### CAD-098-02 — Los estados de Command y la semántica READY/COMPLETED son inequívocos

- [ ] transiciones y diferencia READY/COMPLETED son reproducibles y sin ambigüedad.

### CAD-098-03 — El payload por `commandType` queda tipado y allowlisted

- [ ] payload allowlisted rechaza blobs, PII y campos no tipados.

### CAD-098-04 — Retries técnicos y errores de negocio siguen caminos distintos

- [ ] retry técnico y cancelación de negocio siguen caminos distintos y auditados.

### CAD-098-05 — Revisiones, idempotencia y actor del servidor gobiernan toda transición

- [ ] expected revision, idempotencia y actor/timestamps gobiernan toda mutación.

### CAD-098-06 — La aprobación exige evidencia de duplicate command y producción parcial

- [ ] fixtures cubren duplicados, retries, carreras y producción parcial.

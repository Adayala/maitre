# Verificación — SPEC-095

## Criterios

### CAD-095-01 — Los eventos ready parciales y agregados quedan diferenciados y versionados

- [ ] item-ready y order-ready tienen fronteras y nombres inequívocos.

### CAD-095-02 — La emisión parcial no afirma readiness agregada

- [ ] readiness parcial no dispara readiness agregada prematura.

### CAD-095-03 — Los payloads exponen IDs operativos, station y revisiones suficientes

- [ ] payloads exponen station, timestamps y revisiones necesarias.

### CAD-095-04 — Retries y eventos tardíos no producen readiness falsa

- [ ] retries, dedupe y reorder no generan readiness falsa.

### CAD-095-05 — Los payloads omiten PII y exceso comercial

- [ ] payloads omiten PII, notas y exceso comercial.

### CAD-095-06 — La aprobación exige evidencia de parcialidad, reorder y correlación

- [ ] fixtures cubren parcialidad, correlación y evolución compatible.

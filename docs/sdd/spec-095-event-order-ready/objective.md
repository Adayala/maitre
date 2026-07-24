# Objetivo — SPEC-095

Definir los eventos normativos de readiness parcial y agregada de Order con semántica monotónica y
payload mínimo operativo.

## Criterios de aceptación

### CAD-095-01 — Los eventos ready parciales y agregados quedan diferenciados y versionados

eventos item/allocation-ready y order-ready quedan diferenciados y versionados con
claridad.

### CAD-095-02 — La emisión parcial no afirma readiness agregada

la emisión parcial no afirma readiness agregada y la agregada depende de la derivación
autorizada.

### CAD-095-03 — Los payloads exponen IDs operativos, station y revisiones suficientes

payloads incluyen IDs operativos, station, timestamps y revisiones suficientes.

### CAD-095-04 — Retries y eventos tardíos no producen readiness falsa

retries, duplicados y eventos tardíos no producen readiness falsa ni regresiones.

### CAD-095-05 — Los payloads omiten PII y exceso comercial

payloads omiten PII, notas libres y datos comerciales no necesarios.

### CAD-095-06 — La aprobación exige evidencia de parcialidad, reorder y correlación

La aprobación exige fixtures de parcialidad, reorder, dedupe, evolución y correlación.

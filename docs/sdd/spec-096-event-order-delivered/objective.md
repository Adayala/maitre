# Objetivo — SPEC-096

Definir los eventos normativos de delivery parcial y agregada de Order con confirmación de handoff,
sin acoplar cierre comercial o de pago.

## Criterios de aceptación

### CAD-096-01 — Los eventos delivered parciales y agregados quedan diferenciados y versionados

eventos item-delivered y order-delivered quedan diferenciados y versionados con claridad.

### CAD-096-02 — La entrega parcial y agregada responden a transiciones monotónicas distintas

entrega parcial y entrega agregada responden a transiciones lógicas distintas y
monotónicas.

### CAD-096-03 — Los payloads incluyen actor, canal y revisiones suficientes

payloads incluyen actor/channel, timestamps y revisiones suficientes para downstreams
operativos.

### CAD-096-04 — Retries y reorder convergen sin cierres falsos

retries, duplicados y reorder convergen sin cierres falsos ni regresiones.

### CAD-096-05 — Los eventos delivered no capturan pago ni exponen PII

los eventos no capturan pago, no cierran Check y omiten PII.

### CAD-096-06 — La aprobación exige evidencia de handoff, parcialidad y correlación

La aprobación exige fixtures de handoff repetido, parcialidad, cancelación, correlación y
aislamiento.

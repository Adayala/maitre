# Verificación — SPEC-096

## Criterios

### CAD-096-01 — Los eventos delivered parciales y agregados quedan diferenciados y versionados

- [ ] item-delivered y order-delivered poseen fronteras claras.

### CAD-096-02 — La entrega parcial y agregada responden a transiciones monotónicas distintas

- [ ] parcialidad y transición agregada son monotónicas y no ambiguas.

### CAD-096-03 — Los payloads incluyen actor, canal y revisiones suficientes

- [ ] actor, canal, timestamps y revisiones están presentes en el payload mínimo.

### CAD-096-04 — Retries y reorder convergen sin cierres falsos

- [ ] retries, dedupe y reorder no cierran órdenes falsamente.

### CAD-096-05 — Los eventos delivered no capturan pago ni exponen PII

- [ ] eventos no cierran Check ni exponen PII o payment details.

### CAD-096-06 — La aprobación exige evidencia de handoff, parcialidad y correlación

- [ ] fixtures cubren repeated handoff, cancelación y cross-scope.

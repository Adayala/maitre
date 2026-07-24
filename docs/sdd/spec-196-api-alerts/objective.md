# Objetivo — SPEC-196

Definir la API de alertas para gobernar reglas y activaciones sin mezclar preview con notificación
real ni automatizar sobre señales stale.

## Criterios de aceptación

### CAD-196-01 — La API cubre CRUD, publish, preview histórico y lifecycle de activaciones

La API expone CRUD/publish de AlertRule, preview histórico sin notifications y activation list con
comandos `acknowledge`, `resolve`, `dismiss`, `snooze`, `reopen`.

### CAD-196-02 — Los comandos usan `If-Match` e idempotencia

Los comandos usan `If-Match` e idempotencia.

### CAD-196-03 — Resolve y dismiss exigen reason; `reopen` requiere evidencia válida

Resolve y dismiss exigen reason; `reopen` sólo aplica para nueva evidence o manual review válida.

### CAD-196-04 — Fallos de notificación no cambian la activación

Failure de notificación no cambia la activation y sigue retry/DLQ aparte.

### CAD-196-05 — Inputs stale o contradictorios bloquean automation

Inputs stale o contradictorios bloquean automation; runbook y owner son obligatorios antes de publish.

### CAD-196-06 — La aprobación exige evidencia de preview, lifecycle, reasons y stale-blocking

La aprobación exige fixtures de preview sin notify, lifecycle commands, reasons, notification failure
y bloqueo por señales stale/contradictorias.

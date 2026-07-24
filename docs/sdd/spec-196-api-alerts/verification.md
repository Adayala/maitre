# Verificación — SPEC-196

## Criterios

### CAD-196-01 — Recursos cubren CRUD, publish, preview y lifecycle de activaciones

Recursos cubren CRUD/publish/preview de reglas y lifecycle de activaciones.

### CAD-196-02 — Commands usan `If-Match` e idempotencia

Commands usan `If-Match` e idempotencia.

### CAD-196-03 — Resolve y dismiss requieren reason; reopen exige evidencia nueva o review manual

Resolve/dismiss requieren reason y reopen exige nueva evidence/manual review.

### CAD-196-04 — Fallos de notificación no mutan activation y siguen retry o DLQ aparte

Fallos de notificación no mutan activation y siguen retry/DLQ aparte.

### CAD-196-05 — Inputs stale o contradictorios bloquean automation; runbook y owner son obligatorios

Stale/contradictory inputs bloquean automation; runbook/owner son obligatorios.

### CAD-196-06 — Fixtures cubren preview, lifecycle, reasons, failures y stale-blocking

Fixtures cubren preview, lifecycle, reasons, failures y stale-blocking.

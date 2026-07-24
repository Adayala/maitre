# Objetivo — SPEC-089

Definir la API de modificaciones post-submit mediante comandos versionados, saga auditada y
compensaciones explícitas.

## Criterios de aceptación

### CAD-089-01 — La API define comandos y estados de OrderAdjustment con autoridad clara

comandos soportados, payloads y estado de OrderAdjustment quedan definidos con autoridad
clara.

### CAD-089-02 — La saga de modificación especifica pasos, terminales y correlación

saga entre Order, KitchenTicket y Check especifica pasos, resultados terminales y
correlación.

### CAD-089-03 — Los estados sensibles requieren controles de excepción explícitos

ítems en estados productivos sensibles o con pagos iniciados requieren controles de
excepción explícitos.

### CAD-089-04 — Idempotencia y revisiones evitan deltas o compensaciones duplicados

idempotencia, expected revision y reintentos no duplican deltas ni compensaciones.

### CAD-089-05 — La modificación no reescribe historial y queda auditada

el historial original no se reescribe y toda modificación queda auditada con actor, motivo
y delta.

### CAD-089-06 — La aprobación exige evidencia de compensación, pagos y revisión desactualizada

La aprobación exige fixtures de compensación, retry, revisión desactualizada, item ready, pagos y
aislamiento.

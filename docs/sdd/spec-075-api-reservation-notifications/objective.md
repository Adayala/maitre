# Objetivo — SPEC-075

Definir intenciones de notificación desacopladas, idempotentes y gobernadas por propósito,
consentimiento, opt-out, template y channel.

## Criterios de aceptación

### CAD-075-01 — Los comandos comunicacionales se separan de la lectura de delivery

confirmación, reminder y cancelación comunicacional son comandos distintos y sólo existe
una lectura redactada de intent/delivery.

### CAD-075-02 — Cada intento congela snapshot comunicacional e identidad idempotente

Cada comando congela Reservation, propósito, channel, locale, template, destination ref,
consent/basis e identidad idempotente.

### CAD-075-03 — Intent y outbox se confirman sin llamar al provider ni mutar Reservation

intent y outbox se confirman atómicamente sin llamar al provider ni mutar lifecycle de
Reservation.

### CAD-075-04 — Opt-out y gobernanza por propósito/channel no admiten bypass

propósito/channel aplica opt-out, template eligibility, dedupe y rate limits sin permitir
reclasificación para eludir preferencias.

### CAD-075-05 — Reintentos y callbacks convergen en proyección separada y segura

retries, provider outage y delivery callbacks convergen en proyección separada y nunca
exponen contacto, tokens o secretos.

### CAD-075-06 — La aprobación exige evidencia de consent, DLQ y aislamiento

La aprobación exige fixtures de consent, template faltante, duplicate, replay, DLQ, RBAC,
redacción y aislamiento.

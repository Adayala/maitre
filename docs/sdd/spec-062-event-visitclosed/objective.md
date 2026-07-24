# Objetivo — SPEC-062

Publicar el cierre validado de Visit sin confundir request-close con cierre consumado y
preservar explícitamente cualquier reapertura correctiva posterior.

## Criterios de aceptación

### CAD-062-01 — VisitClosed representa sólo el cierre consumado de la visita

`floor.visit.closed.v1` sólo representa `CLOSING → CLOSED`; request-close y fallos no
publican el hecho.

### CAD-062-02 — El cierre publica evento sólo con atomicidad completa

Cierre de Visit, Occupancies y outbox comparten atomicidad tras validar
Check/Payments/Kitchen.

### CAD-062-03 — El payload de cierre es mínimo y libre de PII o importes

payload cerrado contiene sólo scope, referencias, timestamps y revisiones mínimas, sin
PII ni importes.

### CAD-062-04 — La reapertura correctiva queda separada y correlacionada

reopen correctivo publica `floor.visit.reopened.v1` con cierre previo, reason code,
timestamp y nueva revisión correlacionados.

### CAD-062-05 — El delivery de cierre y reapertura converge por revisión

Ambos eventos usan partition Visit, delivery al menos una vez y reglas de
dedupe/reorder/gap por revisión.

### CAD-062-06 — La aprobación exige evidencia de blockers, corrección y compatibilidad

La aprobación exige fixtures de blockers, rollback, duplicate, corrección, redacción,
compatibilidad y aislamiento.

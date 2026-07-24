# Objetivo — SPEC-170

Definir el estándar de evaluación y operación para conectores de plataformas externas de reseñas sin
prometer capacidades no verificadas.

## Criterios de aceptación

### CAD-170-01 — Cada provider declara capabilities explícitas y límites operativos

cada provider declara capabilities explícitas para polling/webhook, pagination, edit/delete,
attribution, allowed storage, rate limits, retention y freshness.

### CAD-170-02 — Credentials viven en secret adapters y raw payload no cruza el dominio

credentials viven sólo en secret adapters y raw provider payload nunca atraviesa el
dominio principal.

### CAD-170-03 — Cada adapter requiere spike fechado con fuentes oficiales y exit strategy

cada adapter requiere un spike fechado con fuentes oficiales, scopes, cuotas/costo, ToS,
data rights, webhook authenticity, delete behavior y exit strategy.

### CAD-170-04 — Sólo `PASS` habilita o promete el conector

el resultado del spike es `PASS`, `FAIL` o `INCONCLUSIVE`; sin `PASS` no se promete ni
habilita el conector.

### CAD-170-05 — Fallas externas no bloquean feedback propio ni otras capacidades

backoff, retries y DLQ no bloquean el flujo de feedback propio ni degradan otras
capacidades del dominio.

### CAD-170-06 — La aprobación exige evidencia de capabilities, authenticity y exit strategy

La aprobación exige fixtures o evidencias de capabilities, fallas de provider, webhook
authenticity, secret isolation y exit strategy.

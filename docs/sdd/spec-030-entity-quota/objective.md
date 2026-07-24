# Objetivo — SPEC-030

## Propósito

Contabilizar consumo actual o periódico contra un Entitlement cuantitativo usando una fuente
autoritativa, sin permitir overbooking por proyecciones stale.

## Criterios de aceptación

### CAD-030-01 — Quota identifica tenant, usage code, scope y período

Quota identifica tenant + usage code + scope + período y enlaza el Entitlement efectivo comparado.

### CAD-030-02 — Used se deriva de una fuente autoritativa y la UI no decide admisión

Used se deriva de una fuente autoritativa/revision; la UI puede mostrar una estimación, pero no
decide admisión.

### CAD-030-03 — Toda mutación que consume cupo revalida y reserva o libera atómicamente

Toda mutación que consume cupo revalida y reserva/libera atómicamente para impedir overbooking
concurrente.

### CAD-030-04 — Límite exacto, unlimited y denied tienen outcomes distintos

Límite exacto, unlimited explícito y denied tienen outcomes distintos; ausencia de Entitlement falla
cerrado.

### CAD-030-05 — Reducción por debajo del consumo entra `PENDING_REMEDIATION`

Reducción por debajo del consumo entra `PENDING_REMEDIATION`; no borra recursos ni aplica
silenciosamente.

### CAD-030-06 — Reset periódico, reconciliación, warnings, concurrencia y aislamiento poseen evidencia contractual

Reset periódico, reconciliación, warnings, concurrencia y aislamiento poseen evidencia contractual.

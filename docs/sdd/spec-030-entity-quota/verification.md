# Verificación — SPEC-030

## Criterios

### CAD-030-01 — Quota identifica tenant + usage code + scope + período y enlaza el Entitlement efectivo comparado

- [ ] la identidad de quota incluye tenant, usage code, scope y período;
- [ ] la quota enlaza el Entitlement efectivo comparado;
- [ ] cross-tenant falla cerrado.

### CAD-030-02 — Used se deriva de una fuente autoritativa/revision; la UI puede mostrar una estimación, pero no decide admisión

- [ ] used se deriva de fuente autoritativa;
- [ ] la UI no decide admisión;
- [ ] la revision de origen queda trazada.

### CAD-030-03 — Toda mutación que consume cupo revalida y reserva/libera atómicamente para impedir overbooking concurrente

- [ ] admisión hasta límite exacto es correcta y la siguiente falla;
- [ ] dos creates concurrentes no exceden límite;
- [ ] rollback libera reserva sin contador negativo.

### CAD-030-04 — Límite exacto, unlimited explícito y denied tienen outcomes distintos; ausencia de Entitlement falla cerrado

- [ ] límite exacto, unlimited y denied producen outcomes distintos;
- [ ] ausencia de Entitlement falla cerrado;
- [ ] la admisión nunca infiere capacidad ausente.

### CAD-030-05 — Reducción por debajo del consumo entra `PENDING_REMEDIATION`; no borra recursos ni aplica silenciosamente

- [ ] reducción bajo uso entra remediation;
- [ ] no borra recursos;
- [ ] no se aplica silenciosamente.

### CAD-030-06 — Reset periódico, reconciliación, warnings, concurrencia y aislamiento poseen evidencia contractual

- [ ] reconciliación detecta/corrige drift con evidencia;
- [ ] reset periódico no mezcla ventanas;
- [ ] warnings, concurrencia y aislamiento poseen evidencia contractual.

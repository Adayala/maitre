# Verificación — SPEC-165

## Criterios

### CAD-165-01 — El job es idempotente por revisión y versions exactas

- [ ] job idempotente se define por revisión y versions exactas.

### CAD-165-02 — Baja confianza termina en `ABSTAINED`, no en label forzado

- [ ] baja confianza termina en `ABSTAINED`, no en label forzado.

### CAD-165-03 — Antes del provider se validan base, clasificación, redacción y budget

- [ ] budget, purpose/base, clasificación y redaction se validan antes del provider.

### CAD-165-04 — Texto sensible, prompts internos y secrets no salen del boundary

- [ ] texto sensible, prompts internos y secrets no salen del boundary.

### CAD-165-05 — Administración de modelos/prompts usa permisos separados

- [ ] administración de modelos/policies usa permisos separados.

### CAD-165-06 — La aprobación exige evidencia de abstain, budget y separación de permisos

- [ ] fixtures cubren abstain, budget, redaction, idempotencia y fallas de provider.

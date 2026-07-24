# Verificación — SPEC-029

## Criterios

### CAD-029-01 — La identidad lógica es tenant + entitlement code + scope y el code/type existe en catálogo versionado

- [ ] el code/type existe en catálogo versionado;
- [ ] scope cross-tenant no genera capacidad;
- [ ] la identidad lógica del entitlement queda bien formada.

### CAD-029-02 — Valor efectivo enlaza fuentes, revision de cálculo, vigencia y computedAt

- [ ] el valor efectivo conserva source refs, revision, vigencia y computedAt;
- [ ] LIMITED/UNLIMITED/DENIED producen outcomes distintos;
- [ ] la proyección distingue tipo y estado de capacidad.

### CAD-029-03 — Recomputation es idempotente y reemplaza la proyección atómicamente

- [ ] fuentes iguales producen proyección byte/semánticamente equivalente;
- [ ] recomputación idempotente reemplaza atómicamente;
- [ ] no hay ventana intermedia de capacidad ampliada.

### CAD-029-04 — Fuentes inválidas/expiradas o cache stale nunca amplían capacidad; privileged capability falla cerrado

- [ ] source inválida/expirada falla cerrado;
- [ ] cache stale no amplía capacidad;
- [ ] privileged capability desconocida o inválida falla cerrado.

### CAD-029-05 — Override requiere autoridad, razón, vigencia y auditoría; no edita el Entitlement derivado directamente

- [ ] override sin autoridad/razón/expiry se rechaza;
- [ ] el override no edita directamente la proyección derivada;
- [ ] la auditoría conserva motivo y vigencia.

### CAD-029-06 — Reducción, expiración, scopes, invalidación y aislamiento poseen evidencia

- [ ] reducción e invalidación reemplazan atómicamente sin ventana de ampliación;
- [ ] expiración y scopes se comportan según contrato;
- [ ] aislamiento y evidencia contractual quedan enlazados.

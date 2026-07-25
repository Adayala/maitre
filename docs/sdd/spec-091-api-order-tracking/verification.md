# Verificación — SPEC-091

## Criterios

### CAD-091-01 — El tracking define endpoints, payload y semántica temporal estables

- [ ] payload declara `aggregateRevision`, `projectionCursor`, `asOf` y `lastConfirmedAt` con contrato estable;
- [ ] `freshness.mode` y `freshness.consistency` quedan definidos.

### CAD-091-02 — El acceso público y el interno quedan separados por capability y permiso

- [ ] token público y permiso interno aplican aislamiento correcto;
- [ ] acceso interno respeta tenant + scope de sucursal sobre la orden.

### CAD-091-03 — La proyección converge sin retroceder estados terminales

- [ ] el contrato declara monotonicidad y no-autoridad de comando;
- [ ] la implementación I0 no contradice el contrato aunque use live snapshot del agregado.

### CAD-091-04 — El payload público redacta precios, PII e instrucciones internas

- [ ] payload público redacciona nombres, precios, PII y notas internas.

### CAD-091-05 — El contrato declara consistencia eventual y niega autoridad de comando

- [ ] el contrato explicita consistencia eventual y niega uso como precondición.

### CAD-091-06 — La aprobación exige evidencia de reorder, lag y reconstrucción

- [ ] fixtures cubren redacción, metadata temporal y cruces de alcance;
- [ ] rebuild/reorder/revocación expuesta por API quedan como endurecimiento posterior si no están materializados.

# Verificación — SPEC-091

## Criterios

### CAD-091-01 — El tracking define endpoints, payload y semántica temporal estables

- [ ] payload declara revisión, cursor y `asOf` con contrato estable.

### CAD-091-02 — El acceso público y el interno quedan separados por capability y permiso

- [ ] token público y permiso interno aplican aislamiento y revocación correctos.

### CAD-091-03 — La proyección converge sin retroceder estados terminales

- [ ] duplicados, reorder y replay no retroceden terminales.

### CAD-091-04 — El payload público redacta precios, PII e instrucciones internas

- [ ] payload público redacciona precios, PII y notas internas.

### CAD-091-05 — El contrato declara consistencia eventual y niega autoridad de comando

- [ ] el contrato explicita consistencia eventual y niega uso como precondición.

### CAD-091-06 — La aprobación exige evidencia de reorder, lag y reconstrucción

- [ ] fixtures cubren lag, rebuild, revocación y cruces de alcance.

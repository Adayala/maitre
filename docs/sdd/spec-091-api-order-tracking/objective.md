# Objetivo — SPEC-091

Definir la API de tracking de Orders como proyección eventual, pública o interna, con cursores,
freshness y privacidad operativa.

## Criterios de aceptación

### CAD-091-01 — El tracking define endpoints, payload y semántica temporal estables

endpoints, payload de tracking y semántica de `asOf`, revisión y projection cursor quedan
definidos.

### CAD-091-02 — El acceso público y el interno quedan separados por capability y permiso

acceso público usa capability separada y acceso interno valida permiso + alcance.

### CAD-091-03 — La proyección converge sin retroceder estados terminales

la proyección converge con eventos duplicados o fuera de orden sin retroceder estados
terminales.

### CAD-091-04 — El payload público redacta precios, PII e instrucciones internas

payload público redacta precios, PII, notas sensibles e instrucciones internas.

### CAD-091-05 — El contrato declara consistencia eventual y niega autoridad de comando

la API declara consistencia eventual y no sirve como precondición de comandos.

### CAD-091-06 — La aprobación exige evidencia de reorder, lag y reconstrucción

La aprobación exige fixtures de reorder, lag, revocación, reconstrucción y aislamiento.

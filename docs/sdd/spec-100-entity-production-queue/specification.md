# Especificación — SPEC-100 ProductionQueue

Read model reconstruible de Commands por Station. En este I0 es una consulta computada en vivo,
no una proyección almacenada. Expone `stationId`, `commands` y `asOf`; nunca autoriza transiciones.

Orden estable: `priority` descendente, `receivedAt` ascendente e `id` como desempate final.
Repriorización modifica la prioridad autoritativa del Command mediante comando dedicado; no edita
posiciones directamente. No existen `priority bands`, `promisedAt`, expiry del boost ni aging
anti-starvation en este I0.

ProductionQueue pertenece lógicamente a una `stationId` y expone una vista ordenada de Commands no
terminales con `asOf`. No hay `projectionRevision`, `projectionCursor` ni `freshness` materializados.
Su contrato no autoriza `claim`, `start`, `ready`, `complete` ni `cancel`: esas acciones deben
ejecutarse contra los agregados autoritativos correspondientes.

Si dos Commands empatan en prioridad y tiempo de recepción, el desempate por `id` garantiza orden
reproducible sin depender del almacenamiento o de la hora de lectura.

Reprioritization modifica atributos autoritativos del Command mediante un comando auditado con
`reason`; la queue refleja ese cambio, pero nunca lo origina.

# Especificación — SPEC-100 ProductionQueue

Read model reconstruible de Commands por Station. Expone projection revision, cursor, `asOf` y
freshness; nunca autoriza transiciones.

Orden estable: priority band, promisedAt, receivedAt e ID. Repriorización modifica una prioridad
autoritativa mediante command, guardando reason, actor, expiry y policy version; no edita índices.
Se limita el número/duración de boosts y aging eleva trabajo antiguo para impedir starvation.
Eventos duplicados o fuera de orden convergen por aggregate revision.

ProductionQueue pertenece lógicamente a una `stationId` y expone una vista ordenada de Commands no
terminales con `projectionRevision`, `projectionCursor`, `asOf` y `freshness`. Su contrato no
autoriza `claim`, `start`, `ready`, `complete` ni `cancel`: esas acciones deben ejecutarse contra
los agregados autoritativos correspondientes.

El orden estable combina `priorityBand`, `promisedAt`, `receivedAt` e `id` en forma canónica. Si
dos Commands empatan en los primeros campos, el último desempate por ID garantiza orden reproducible
sin depender del almacenamiento o de la hora de lectura.

Reprioritization modifica atributos autoritativos del Command o del flujo de priorización mediante
un comando versionado y auditado que guarda `reason`, `actor`, `expiresAt?` y `policyVersion`. La
proyección refleja ese cambio, pero nunca lo origina. El aging es una policy derivada y declarada,
no una mutación silenciosa del historial.

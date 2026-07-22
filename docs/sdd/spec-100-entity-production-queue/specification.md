# Especificación — SPEC-100 ProductionQueue

Read model reconstruible de Commands por Station. Expone projection revision, cursor, `asOf` y
freshness; nunca autoriza transiciones.

Orden estable: priority band, promisedAt, receivedAt e ID. Repriorización modifica una prioridad
autoritativa mediante command, guardando reason, actor, expiry y policy version; no edita índices.
Se limita el número/duración de boosts y aging eleva trabajo antiguo para impedir starvation.
Eventos duplicados o fuera de orden convergen por aggregate revision.

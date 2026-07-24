# Rules — SPEC-117

- No existe edición directa de TimeEntry histórica.
- Servidor fija `receivedAt`; cliente aporta evidencia, no autoridad temporal absoluta.
- Replay, skew o Employment dudoso derivan a review sin perder evidencia.
- Requester no puede aprobar su propio ajuste.
- Ajustes sobre períodos exportados son retroactivos append-only.

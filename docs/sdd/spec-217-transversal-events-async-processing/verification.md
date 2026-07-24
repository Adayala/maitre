# Verificación — SPEC-217

## Criterios

### CAD-217-01 — Todo cambio comprometido publica hechos mediante outbox recuperable y atómico

- [ ] rollback de negocio no deja evento publicable;
- [ ] commit exitoso siempre deja outbox recuperable;
- [ ] crash antes de marcar published permite reentrega segura;
- [ ] dos publishers no procesan el mismo lease simultáneamente.

### CAD-217-02 — La entrega es at-least-once con consumidores idempotentes y efectos deduplicables

- [ ] reentrega no duplica el efecto local;
- [ ] misma operación externa reutiliza idempotency key estable;
- [ ] la deduplicación conserva comportamiento determinista.

### CAD-217-03 — El orden sólo se garantiza por agregado y los gaps son detectables

- [ ] `aggregateVersion` repetida se clasifica duplicate/stale;
- [ ] un gap se detecta, observa y reconcilia;
- [ ] eventos de agregados distintos no dependen de orden global.

### CAD-217-04 — Los fallos asíncronos tienen retry, dead-letter, recovery manual y observabilidad explícitos

- [ ] fallo transitorio reintenta con backoff/jitter acotado;
- [ ] fallo permanente llega a dead-letter sin retry infinito;
- [ ] lease vencido vuelve a estar disponible;
- [ ] replay requiere permiso y conserva intentos anteriores;
- [ ] timeout externo incierto consulta estado antes de repetir.

### CAD-217-05 — Los contratos de evento evolucionan sin romper consumidores existentes

- [ ] consumidor anterior tolera cambio aditivo;
- [ ] cambio incompatible convive mediante nueva versión;
- [ ] payload y telemetría no contienen secretos/PII no aprobada.

### CAD-217-06 — La infraestructura inicial funciona en PostgreSQL/Vercel y conserva portabilidad a un broker futuro

- [ ] métricas detectan backlog, age, retries, gaps y failures;
- [ ] publisher corre en Vercel y proceso Node estándar;
- [ ] la portabilidad a otro transporte queda respaldada por diseño y evidencia.

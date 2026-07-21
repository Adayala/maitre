# Verificación — SPEC-217

## Atomicidad

- [ ] Rollback de negocio no deja evento publicable.
- [ ] Commit exitoso siempre deja outbox recuperable.
- [ ] Crash antes de marcar published permite reentrega segura.
- [ ] Dos publishers no procesan el mismo lease simultáneamente.

## Idempotencia y orden

- [ ] Reentrega no duplica el efecto local.
- [ ] Misma operación externa reutiliza idempotency key estable.
- [ ] aggregateVersion repetida se clasifica duplicate/stale.
- [ ] Un gap se detecta, observa y reconcilia.
- [ ] Eventos de agregados distintos no dependen de orden global.

## Fallos y recovery

- [ ] Fallo transitorio reintenta con backoff/jitter acotado.
- [ ] Fallo permanente llega a dead-letter sin retry infinito.
- [ ] Lease vencido vuelve a estar disponible.
- [ ] Replay requiere permiso y conserva intentos anteriores.
- [ ] Timeout externo incierto consulta estado antes de repetir.

## Compatibilidad y operación

- [ ] Consumidor anterior tolera cambio aditivo.
- [ ] Cambio incompatible convive mediante nueva versión.
- [ ] Payload y telemetría no contienen secretos/PII no aprobada.
- [ ] Métricas detectan backlog, age, retries, gaps y failures.
- [ ] Publisher corre en Vercel y proceso Node estándar.

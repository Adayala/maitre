# Verificación — SPEC-034

## Criterios

### CAD-034-01 — Una transición confirmada a INACTIVE produce una intención lógica `subscription.service.deactivated.v1` para `SubscriptionItem/itemId`

- [ ] transición INACTIVE confirmada produce una intención lógica;
- [ ] aggregate/itemId coincide con contrato;
- [ ] la desactivación lógica no se duplica.

### CAD-034-02 — Item y outbox se confirman atómicamente; retry físico conserva eventId

- [ ] rollback no deja evento publicable;
- [ ] retry conserva eventId;
- [ ] item y outbox son atómicos.

### CAD-034-03 — Payload incluye refs, scopes afectados, effectiveAt, reasonCode y revisions, sin texto sensible, precio, pago o PII

- [ ] schema/scopes/reason/correlation cumplen v1;
- [ ] payload no contiene price/payment/PII/texto sensible;
- [ ] reasonCode y revisions quedan trazados.

### CAD-034-04 — Consumidores invalidan/recalculan idempotentemente y convergen ante duplicados/reordenamiento con activated

- [ ] consumidores deduplican;
- [ ] reorder con activated converge por revision;
- [ ] invalidación/recalculo es idempotente.

### CAD-034-05 — Nuevas acciones fallan cerrado según Entitlement efectivo; cleanup/retención y operación en curso siguen contratos propios, no este evento

- [ ] evento no sustituye Entitlement;
- [ ] evento no dispara cleanup destructivo;
- [ ] nuevas acciones consultan el Entitlement efectivo.

### CAD-034-06 — Schema, atomicidad, ordering, retry/DLQ, redacción y compatibilidad poseen evidencia contractual

- [ ] ordering y retry/DLQ poseen evidencia;
- [ ] redacción y versionado siguen contrato;
- [ ] compatibilidad futura queda verificada.

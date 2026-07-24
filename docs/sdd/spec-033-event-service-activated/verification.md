# Verificación — SPEC-033

## Criterios

### CAD-033-01 — Una transición confirmada a ACTIVE produce una intención lógica `subscription.service.activated.v1` para aggregate `SubscriptionItem/itemId`

- [ ] transición ACTIVE confirmada produce una intención lógica;
- [ ] aggregate/itemId coincide con contrato;
- [ ] no se generan activaciones lógicas duplicadas.

### CAD-033-02 — Item y outbox se confirman atómicamente; retry físico conserva eventId

- [ ] rollback no deja evento publicable;
- [ ] retry conserva eventId;
- [ ] item y outbox son atómicos.

### CAD-033-03 — Payload incluye tenant/subscription/item/serviceCode, alcances, effectiveAt y source/calculation revision, sin precio, pago, PII ni config sensible

- [ ] schema/alcance/correlation cumplen v1;
- [ ] payload no contiene price/payment/PII/config sensible;
- [ ] la revision de fuente/cálculo queda trazada.

### CAD-033-04 — Consumidores deduplican y convergen por revision aun con duplicados o reordenamiento

- [ ] consumidores deduplican;
- [ ] reorder converge por source revision;
- [ ] duplicados físicos no cambian el outcome lógico.

### CAD-033-05 — El evento sólo informa cambio de fuente; autorización/admisión consulta Entitlement/Quota efectivos

- [ ] consumidor no usa el evento como autorización;
- [ ] la admisión sigue consultando Entitlement/Quota;
- [ ] el evento sólo informa cambio de fuente.

### CAD-033-06 — Schema, atomicidad, alcances, retry/DLQ, redacción y compatibilidad poseen evidencia contractual

- [ ] retry/DLQ posee evidencia;
- [ ] alcances y redacción siguen contrato;
- [ ] compatibilidad/versionado queda verificado.

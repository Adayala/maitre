# Especificación — SPEC-058

Superficie I0:

- `POST /v1/visits/{visitId}/check`;
- `GET /v1/visits/{visitId}/check`;
- `GET /v1/checks/{checkId}`;
- `POST /v1/checks/{checkId}/adjustments`;
- `POST /v1/checks/{checkId}/request-payment`;
- `POST /v1/checks/{checkId}/settle`;
- `POST /v1/checks/{checkId}/void`.

Create y comandos reciben `Idempotency-Key`; mutaciones existentes requieren `If-Match`.
Totales siempre se recalculan server-side desde snapshots; campos monetarios derivados en
requests se rechazan como schema inválido.

La respuesta incluye revisión, currency, gross/discount/tax/service/tip/paid/balance y resúmenes de Payment
redactados. Settle exige balance cero y cero operaciones ambiguas. MVP no ofrece split. Invoice se
crea mediante contrato fiscal separado y no cambia Check ante rechazo externo.

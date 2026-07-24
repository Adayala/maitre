# Structure — SPEC-053

Estructura lógica:

- identidad y scope: `paymentId`, `tenantId`, `branchId`, `checkId`, `checkRevision`;
- intención: `amount`, `currency`, `tipAmount`, `method`, `idempotencyKey`;
- proveedor: `providerCode?`, referencia opaca de operación y versión del adaptador;
- ciclo: `status`, timestamps por transición y reason/error codes sanitizados;
- control: `revision`, actor/canal y auditoría.

Refund es un ledger separado con `refundId`, capture referenciada, amount/currency,
idempotency key y ciclo `PENDING | SUCCEEDED | FAILED`. Los payloads crudos sensibles no
forman parte del modelo.

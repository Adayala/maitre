# Especificación — SPEC-094 OrderSubmitted

El contrato normativo se denomina `ordering.order.submitted.v1`; `OrderPlaced` queda como nombre
legado no publicable. Se emite por outbox cuando submit congela el snapshot y crea despacho de
producción. En este I0 el despacho de producción no ocurre dentro del módulo ordering: el route
layer crea luego los Kitchen Commands correspondientes.

Envelope SPEC-217 + `orderId`, `visitId`, `branchId`, `catalogRevisionId?`, `aggregateRevision`,
`submittedAt`, moneda y totales resumidos. Omite PII y notas. Un reintento del mismo submit no
genera otro hecho lógico; el agregado es idempotente y no publica un segundo evento.

El evento representa exclusivamente la aceptación autoritativa del submit comercial. No sustituye
KitchenTicketCreated, CheckUpdated ni otros hechos derivados; sólo comunica que Order quedó
congelada y apta para downstreams autorizados. El `aggregateRevision` emitido corresponde a la
revisión que materializa el submit.

El payload mínimo real incluye `orderId`, `visitId`, `branchId`, `catalogRevisionId?`,
`aggregateRevision`, `submittedAt`, `currency`, `subtotal`, `taxTotal` y `grandTotal`. `tenantId`
viaja en el envelope, no dentro del payload. No incluye Guest, notas libres, modifiers textuales,
instrucciones internas ni pricing detallado por item.

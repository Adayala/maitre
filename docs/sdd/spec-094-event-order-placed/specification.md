# Especificación — SPEC-094 OrderSubmitted

El contrato normativo se denomina `ordering.order.submitted.v1`; `OrderPlaced` queda como nombre
legado no publicable. Se emite por outbox cuando submit congela el snapshot y crea despacho de
producción.

Envelope SPEC-217 + `orderId`, `visitId`, `branchId`, `catalogRevisionId`, `aggregateRevision`,
`submittedAt`, moneda y totales resumidos. Omite PII y notas. Un reintento del mismo submit no
genera otro hecho lógico; consumidores deduplican por event ID.

El evento representa exclusivamente la aceptación autoritativa del submit comercial. No sustituye
KitchenTicketCreated, CheckUpdated ni otros hechos derivados; sólo comunica que Order quedó
congelada y apta para downstreams autorizados. El `aggregateRevision` emitido corresponde a la
revisión que materializa el submit.

El payload mínimo incluye `tenantId`, `brandId`, `branchId`, `visitId`, `orderId`,
`catalogRevisionId`, `aggregateRevision`, `submittedAt`, `currency`, `subtotal`, `taxTotal`,
`grandTotal` y referencias de correlación aprobadas por SPEC-217. No incluye Guest, notas libres,
modifiers textuales, instrucciones internas ni pricing detallado por item.

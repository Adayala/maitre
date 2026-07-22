# Especificación — SPEC-094 OrderSubmitted

El contrato normativo se denomina `ordering.order.submitted.v1`; `OrderPlaced` queda como nombre
legado no publicable. Se emite por outbox cuando submit congela el snapshot y crea despacho de
producción.

Envelope SPEC-217 + `orderId`, `visitId`, `branchId`, `catalogRevisionId`, `aggregateRevision`,
`submittedAt`, moneda y totales resumidos. Omite PII y notas. Un reintento del mismo submit no
genera otro hecho lógico; consumidores deduplican por event ID.

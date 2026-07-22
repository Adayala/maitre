# Contrato de evento — SPEC-152 InvoiceEmitted

Publicar mediante outbox al autorizar definitivamente un comprobante. El sobre versionado
incluye eventId, occurredAt, tenantId, fiscalEntityId, invoiceId, punto de venta, tipo, número,
CAE redactado y vencimiento; no incluye PII. Tests cubren autorización tras reconciliación,
emisión repetida, rollback, duplicados, compatibilidad, correlación y aislamiento.

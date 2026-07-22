# Contrato de evento — SPEC-151 InvoiceValidated

Publicar `fiscal.invoice.validated.v1` cuando un draft queda listo para solicitar autorización;
`InvoiceGenerated` queda legado no publicable. El sobre
versionado incluye eventId, occurredAt, tenantId, fiscalEntityId, invoiceId, tipo, moneda y
totales agregados, sin receptor ni PII. Consumidores deduplican por eventId. Tests cubren
rollback, regeneración, duplicados, reordenamiento, compatibilidad, correlación y aislamiento.

# Especificación — SPEC-151 InvoiceValidated

Nombre normativo `fiscal.invoice.validated.v1`; `InvoiceGenerated` queda legado no publicable. Se
emite cuando DRAFT pasa a VALIDATED y queda listo para solicitar autorización, no cuando existe un
comprobante fiscal.

Envelope SPEC-217 + fiscalEntity, invoice, voucher type, currency, totals, revisión de fuente de Check y
revisión agregada. Omite receptor/PII. Una nueva validación tras cambios usa revisión superior.

El evento se publica desde outbox transaccional junto con la transición de ciclo de vida validada.
Consumidores deben tratarlo como señal de preparación fiscal y no como evidencia de autorización
oficial. La clave de idempotencia/deduplicación combina `invoiceId`, `eventType` y `aggregateRevision`.

No deben publicarse dos eventos con la misma revisión agregada. Si la invoice vuelve a `DRAFT`,
cambia y se valida otra vez, se emite un nuevo `fiscal.invoice.validated.v1` con revisión superior y
payload actualizado. La compatibilidad con aliases heredados, si existe, se resuelve en adaptadores o
bridges, no en el nombre canónico del dominio.

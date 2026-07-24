# Reglas — SPEC-064

- `CheckOpened`, `CheckAdjusted` y `CheckSettled` reemplazan `CheckGenerated` ambiguo.
- Settled exige balance cero y revision terminal.
- Payload no contiene PII y no equivale a InvoiceAuthorized.
- Cada ajuste confirmado usa identidad, revisión y evento propios.
- `eventId` se conserva en retries; cada revisión posterior usa un hecho lógico nuevo.
- Compatibilidad v1 sólo admite adiciones opcionales; cambiar fórmulas/trigger exige versión.

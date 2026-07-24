# Reglas — SPEC-151

- Nombre canónico publicable: `fiscal.invoice.validated.v1`.
- El evento describe validación previa a autorización, no emisión fiscal.
- Payload omite PII y datos sensibles no necesarios.
- Publicación usa outbox y entrega at-least-once con deduplicación.
- Revalidaciones requieren revisión superior.

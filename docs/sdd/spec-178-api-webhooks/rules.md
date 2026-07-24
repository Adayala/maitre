# Reglas — SPEC-178

- Outbound management e inbound receipt están separados.
- Outbound aplica SSRF controls y revalidación por conexión.
- Inbound verifica raw signature, timestamp y replay antes de procesar.
- Tenant/integration inbound nunca se elige desde payload.
- Fallos permanentes terminan en DLQ auditable.

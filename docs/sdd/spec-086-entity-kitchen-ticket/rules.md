# Reglas — SPEC-086

- Creación por `orderRevision + stationId` debe ser idempotente.
- Ticket sólo contiene datos culinarios mínimos; precio, PII y fiscal quedan fuera.
- Comandos requieren expected revision; duplicados se deduplican sin efectos adicionales.
- Replay y eventos fuera de orden no retroceden líneas terminales.
- Transferencia entre stations genera historial auditado y evita ownership simultáneo.
- KitchenTicket no repricia ni cancela comercialmente OrderItem; coordina sólo producción.

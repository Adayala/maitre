# Rules — SPEC-053

- Amount es positivo, currency coincide con Check y tip se registra por separado.
- Method pertenece a un catálogo versionado; I0 contempla CASH, CARD y TRANSFER sin asumir
  que todos usan proveedor externo.
- CARD requiere referencia opaca del proveedor antes de CAPTURED; nunca PAN/CVV.
- Las transiciones son monotónicas, idempotentes y se validan con revisión.
- Un timeout incierto queda PENDING_RECONCILIATION y no se reintenta como cobro nuevo.
- La suma capturada neta de Refund no supera balance más tip autorizado.
- Cada Refund referencia una captura, admite parcial y no hace negativo su neto.
- CASH CAPTURED y su CashMovement se crean exactamente una vez de forma atómica.
- Callbacks inválidos, duplicados, stale o cross-tenant fallan de forma cerrada y auditada.

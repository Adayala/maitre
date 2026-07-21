# Contrato de workflow — SPEC-110 Kitchen State Machine

Definir la progresión RECEIVED → CLAIMED → IN_PROGRESS → READY → COMPLETED, con HOLD y
CANCELLED como transiciones explícitas sujetas a reglas. Cada transición valida precondiciones,
versión, actor y motivo, persiste historial inmutable y publica su efecto por outbox en la
misma transacción. Tests de tabla cubren todas las aristas válidas e inválidas, reintentos,
concurrencia, recuperación, compensaciones y consistencia con orden y entrega.

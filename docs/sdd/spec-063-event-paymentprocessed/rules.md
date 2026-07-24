# Reglas — SPEC-063

- No se publica un `PaymentProcessed` genérico.
- Authorized, capture succeeded, failed, voided y Refund outcomes son hechos distintos.
- Provider operation/revision evita duplicación y retroceso.
- Payload omite instrumentos, secrets y PII.
- Una operación parcial posee identidad propia; retries conservan el mismo eventId lógico.
- Un callback sólo puede originar evento después de autenticación, anti-replay y transición válida.
- Compatibilidad dentro de v1 es aditiva opcional; cambiar trigger o semántica exige nueva versión.

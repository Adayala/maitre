# Contrato — SPEC-053 Payment

Payment registra intento/resultado de cobro asociado a Check; no almacena PAN, CVV ni
credenciales. Campos: amount/currency, method categorizado, provider/reference opaca,
idempotency key, status `PENDING | AUTHORIZED | CAPTURED | FAILED | REFUNDED | VOID`,
timestamps y auditoría. Transiciones son monotónicas/idempotentes; callbacks duplicados se
deduplican. Total capturado no excede saldo salvo propina/regla explícita. Tests cubren
retry, webhook desordenado, partial failure, redacción y conciliación.

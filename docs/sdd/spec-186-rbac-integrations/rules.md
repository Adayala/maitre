# Reglas — SPEC-186

- Deny-by-default en todo el dominio.
- No existen roles locales implícitos.
- Secrets no son legibles por permisos del dominio.
- OAuth/rotation/endpoint changes requieren step-up y posible segregación.
- Operaciones de webhooks/tests no heredan lectura de secretos.

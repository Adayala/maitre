# Reglas — SPEC-071

- Confirm/cancel actualiza Reservation y CapacityAllocation atómicamente.
- Commands usan idempotency y `If-Match`; no PATCH status.
- Horario usa UTC + timezone IANA + duración.
- Tenant/actor derivan de autenticación; PII requiere permiso separado.
- Create adquiere Hold o revierte completamente.
- Capability pública no puede ampliar acciones, Reservation ni expiry y nunca aparece en logs.
- `404` evita enumeración, `409` expresa capacidad/idempotencia, `412` revisión y `422` transición.

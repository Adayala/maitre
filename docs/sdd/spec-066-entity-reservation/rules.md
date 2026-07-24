# Rules — SPEC-066

- Transiciones: `PENDING → CONFIRMED | CANCELLED | EXPIRED`;
  `CONFIRMED → SEATED | CANCELLED | NO_SHOW`; `SEATED → COMPLETED`.
- PartySize es positivo y válido para CapacityPolicyVersion.
- El intervalo es futuro al crear; comandos posteriores usan reloj inyectado y timezone IANA.
- Confirm siempre revalida y confirma Allocation; una lectura de availability no reserva.
- NO_SHOW sólo se revierte mediante workflow autorizado, reason y capacidad revalidada.
- SEATED no se cancela; correcciones pertenecen a Visit/Check.
- Cada comando usa revisión e idempotencia y publica outbox atómicamente.

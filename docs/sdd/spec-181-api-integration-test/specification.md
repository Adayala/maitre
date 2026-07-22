# Especificación — SPEC-181 Integration Capability Test

No existe test genérico. Cada adapter declara test capability, environment permitido, side effects,
fixtures, cleanup, timeout, rate/budget y redaction. Producción sólo permite read-only health probado;
tests que crean objetos quedan limitados a sandbox con cleanup verificable.

URLs pasan SSRF policy. Command requiere step-up/permiso, idempotencia y audit. Resultado normaliza
checks y limitations sin secrets/raw responses. Capability no demostrada devuelve NOT_SUPPORTED.

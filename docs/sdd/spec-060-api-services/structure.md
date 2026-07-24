# Estructura — SPEC-060

API → autorización/idempotencia → ServicePeriod commands/query → policy + blocker ports
(Visit, Check, Payment, CashSession) → repository/outbox. Business clock, timezone y
resolución DST se inyectan; las dependencias sólo se consultan.

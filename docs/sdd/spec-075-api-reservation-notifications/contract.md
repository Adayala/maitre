# Contrato API — SPEC-075 Reservation Notifications

Commands para solicitar confirmación, recordatorio o cancelación comunicacional sobre una
Reservation. No envían directamente: crean intención/outbox idempotente con template,
locale, channel permitido y consent. Respuesta no incluye provider token ni contacto
completo. Rate limit/dedupe evitan spam; delivery status es proyección separada. Tests cubren
opt-out, retries, duplicate command, template missing, redacción y provider outage.

# Contrato API — SPEC-075 Reservation Notifications

Commands para solicitar confirmación, recordatorio o cancelación comunicacional sobre una
Reservation. No envían directamente: crean intención/outbox idempotente con template,
locale, channel permitido y consent. Respuesta no incluye provider token ni contacto
completo. Rate limit/dedupe evitan spam; delivery status es proyección separada. Tests cubren
autorización, Reservation inexistente, creación de intents y lectura por id.

El I0 actual no es idempotente todavía y no resuelve template, locale, channel, consent ni
provider. Sólo crea un `NotificationIntent` simple (`reservationId`, `purpose`, `status`,
`createdAt`) y un registro de outbox asociado.

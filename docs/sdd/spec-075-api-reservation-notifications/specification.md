# Especificación — SPEC-075 Reservation Notifications API

Superficie I0:

- `POST /v1/reservations/{reservationId}/notification-intents/request-confirmation`;
- `POST /v1/reservations/{reservationId}/notification-intents/send-reminder`;
- `POST /v1/reservations/{reservationId}/notification-intents/communicate-cancellation`;
- `GET /v1/notification-intents/{notificationIntentId}`.

Los POST usan el purpose implícito de cada comando; no aceptan destination, template arbitrario ni
purpose elegido libremente. Crean `NotificationIntent` + outbox y no llaman a ningún provider.
El I0 actual requiere sólo `reservation:notification_send`; todavía no exige `Idempotency-Key` ni
modela capability pública.

Cada intención I0 persiste sólo `reservationId`, `purpose`, `status=CREATED` y `createdAt`. No hay
template versioning, locale/channel resolution, destination reference, evidence de consentimiento
ni distinción `TRANSACTIONAL`/`MARKETING` materializada en la entidad.

El I0 actual no implementa rate limit, dedupe ni delivery-status projection. Un `GET` devuelve el
`NotificationIntent` persistido tal como está. La respuesta expone `id`, `reservationId`,
`purpose`, `status` y `createdAt`; no incluye provider token, destination ni canal resuelto.

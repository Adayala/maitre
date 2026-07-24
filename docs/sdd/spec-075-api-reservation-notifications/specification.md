# Especificación — SPEC-075 Reservation Notifications API

Superficie I0:

- `POST /v1/reservations/{reservationId}/notification-intents/request-confirmation`;
- `POST /v1/reservations/{reservationId}/notification-intents/send-reminder`;
- `POST /v1/reservations/{reservationId}/notification-intents/communicate-cancellation`;
- `GET /v1/notification-intents/{notificationIntentId}`.

Los POST requieren `Idempotency-Key` y permiso/capability específica; no aceptan
destination, template arbitrario ni purpose elegido libremente. Crean NotificationIntent y
outbox, sin llamar al provider dentro de la transacción de Reservation.

Cada intención congela reservation ID, purpose (`TRANSACTIONAL` o `MARKETING`), template version,
locale, channel, destination reference protegida, base/consent evidence e idempotency key. Un
opt-out de marketing no bloquea comunicaciones transaccionales permitidas; nunca se reutiliza el
purpose para eludir una preferencia. Purpose se deriva del comando y
TemplatePolicyVersion; channel/locale se resuelven desde preferencias permitidas y
ContactPoint elegible.

Rate limit y dedupe tienen alcance tenant + reservation + purpose + channel + ventana. Un fallo de
template/provider cambia delivery status, no Reservation. Las respuestas no incluyen credenciales
del proveedor ni contacto completo.
La respuesta expone intentId, purpose/channel categorizados, status, timestamps y reason
codes sanitizados, nunca destination.

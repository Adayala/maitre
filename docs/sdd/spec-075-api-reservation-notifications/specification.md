# Especificación — SPEC-075 Reservation Notifications API

Superficie I0:

- `POST /v1/reservations/{reservationId}/notification-intents/request-confirmation`;
- `POST /v1/reservations/{reservationId}/notification-intents/send-reminder`;
- `POST /v1/reservations/{reservationId}/notification-intents/communicate-cancellation`;
- `GET /v1/notification-intents/{notificationIntentId}`.

Los POST requieren `Idempotency-Key` y permiso/capability específica; no aceptan
destination, template arbitrario ni purpose elegido libremente. Crean NotificationIntent y
outbox, sin llamar al provider dentro de la transacción de Reservation.
El I0 actual mantiene sólo el permiso específico y la creación de NotificationIntent + outbox:
todavía no exige `Idempotency-Key` ni modela capability pública.

Cada intención congela reservation ID, purpose (`TRANSACTIONAL` o `MARKETING`), template version,
locale, channel, destination reference protegida, base/consent evidence e idempotency key. Un
opt-out de marketing no bloquea comunicaciones transaccionales permitidas; nunca se reutiliza el
purpose para eludir una preferencia. Purpose se deriva del comando y
TemplatePolicyVersion; channel/locale se resuelven desde preferencias permitidas y
ContactPoint elegible.
En el I0 actual la intención persiste sólo `reservationId`, `purpose`, `status=CREATED` y
`createdAt`; no hay template versioning, locale/channel resolution, destination reference ni
evidencia de consentimiento persistida en la entidad.

Rate limit y dedupe tienen alcance tenant + reservation + purpose + channel + ventana. Un fallo de
template/provider cambia delivery status, no Reservation. Las respuestas no incluyen credenciales
del proveedor ni contacto completo.
El I0 actual no implementa rate limit, dedupe ni delivery-status projection. Un `GET` devuelve el
NotificationIntent persistido tal como está.
La respuesta expone intentId, purpose/channel categorizados, status, timestamps y reason
codes sanitizados, nunca destination. En el I0 real la respuesta expone `id`, `reservationId`,
`purpose`, `status` y `createdAt`.

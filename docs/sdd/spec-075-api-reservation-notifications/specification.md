# Especificación — SPEC-075 Reservation Notifications API

Los comandos `request-confirmation`, `send-reminder` y `communicate-cancellation` crean una
NotificationIntent y outbox; no llaman al provider dentro de la transacción de Reservation.

Cada intención congela reservation ID, purpose (`TRANSACTIONAL` o `MARKETING`), template version,
locale, channel, destination reference protegida, base/consent evidence e idempotency key. Un
opt-out de marketing no bloquea comunicaciones transaccionales permitidas; nunca se reutiliza el
purpose para eludir una preferencia.

Rate limit y dedupe tienen scope tenant + reservation + purpose + channel + ventana. Un fallo de
template/provider cambia delivery status, no Reservation. Las respuestas no incluyen credenciales
del proveedor ni contacto completo.

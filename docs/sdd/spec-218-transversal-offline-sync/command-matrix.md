# Matriz normativa offline/realtime

| Clase de command | Offline | Conflicto/reconciliación | Retención cliente |
| --- | --- | --- | --- |
| Lectura/proyección | cache permitido con `asOf`/cursor | snapshot + replay/poll | según clasificación |
| Draft no exclusivo | queue permitido | expected revision + merge explícito | payload mínimo cifrado |
| Fichaje laboral | captura permitida | device sequence + server review | hasta ACK/review |
| Capacidad/reserva/mesa | no confirmación offline | autoridad online/hold | intención no autoritativa |
| Order submit/cambio Kitchen | no por default | autoridad online + adjustment | draft local únicamente |
| Payment/cash/reconciliation | prohibido | autoridad online/idempotencia | nunca instrumentos/secrets |
| Fiscal/numeración | prohibido | autoridad online + provider reconcile | ningún certificado/ticket |
| Roles/secrets/integrations | prohibido | autoridad online + step-up | prohibido |
| Feedback no sensible | queue opcional | idempotency + moderation | TTL y consentimiento |
| Autopilot action | prohibido | online approval/command | sólo suggestion |

Realtime distribuye proyecciones y jamás sustituye HTTP, autorización o commit transaccional.
Todo mensaje incluye projection cursor; gap, revocación o overflow fuerza snapshot/polling. El
cliente no aplica last-write-wins universal y muestra `queued/syncing/conflict/rejected`.

Cada spec funcional debe especializar esta matriz antes de declarar soporte offline.

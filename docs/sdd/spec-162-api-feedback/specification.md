# Especificación — SPEC-162 Feedback API

Submit público usa capability `FEEDBACK_SUBMIT` opaca, hasheada, expirable, revocable, rate-limited
y single/submission-limited; no revela Visit/Order. Idempotency, anti-bot, tamaño y sanitización son
obligatorios.

Interno: list/detail y commands `triage`, `assign`, `resolve`, `reopen`, `redact`, todos con
`If-Match`, permiso, reason y audit. Contenido/PII se redacta por default. Delete ejecuta matriz de
retención y no falsifica borrado remoto.

# Especificación — SPEC-162

Submit público usa capability `FEEDBACK_SUBMIT` opaca, hasheada, expirable, revocable, rate-limited
y single/submission-limited; no revela Visit/Order. Idempotency, anti-bot, tamaño y sanitización son
obligatorios.

Interno: list/detail y commands `triage`, `assign`, `resolve`, `reopen`, `redact`, todos con
`If-Match`, permiso, reason y audit. Contenido/PII se redacta por default. Delete ejecuta matriz de
retención y no falsifica borrado remoto.

`POST /feedback-submissions` acepta submissions públicas a través de capability o token efímero
server-issued; `GET /feedback` y `GET /feedback/{feedbackId}` sirven vistas internas; `POST
/feedback/{feedbackId}:triage|assign|resolve|reopen|redact` gestionan el ciclo de vida del caso. Las
operaciones internas usan concurrencia optimista y error canónico `404`/`409`/`412`/`422` según
alcance, ciclo de vida, revisión o semántica inválida.

La respuesta pública nunca confirma existencia de visitas, pedidos o usuarios específicos. La vista
interna separa campos visibles y campos privilegiados; attachments o identidad opcional pueden quedar
ocultos por rol, propósito o política de tratamiento. No existe “delete duro” por conveniencia fuera
de la matriz de retención aprobada.

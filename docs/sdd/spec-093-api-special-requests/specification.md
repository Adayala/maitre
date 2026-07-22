# Especificación — SPEC-093 Special Requests API

Registra request tipada contra Reservation/Visit/Order con estado
`PENDING -> ACCEPTED | REJECTED | FULFILLED`. Sólo un actor operativo autorizado acepta/rechaza;
crear no implica aceptación.

Texto opcional se limita, normaliza y sanitiza; no reemplaza códigos de alérgenos. Purpose,
visibilidad, retención y consentimiento se guardan explícitamente. Eventos/logs omiten el texto y
la API lo redacta salvo permiso específico.

# Especificación — SPEC-074 Availability API

`GET /v1/branches/{branchId}/availability` recibe `partySize`, intervalo local/fecha de negocio,
`durationMinutes` y preferencias permitidas. Devuelve slots con `startAt`, timezone, duración,
`asOf`, policy version, confidence/freshness y reason codes.

Es una consulta determinista sobre inputs versionados; no crea hold, reserva ni garantía. La
respuesta declara expiración/frescura y confirm siempre revalida contra el ledger de capacidad.
No expone Reservation, Guest ni causa identificable de indisponibilidad. Intervalos inválidos,
DST inexistente/ambiguo y party size fuera de política devuelven `422`.

# Especificación — SPEC-074

`GET /v1/branches/{branchId}/availability` recibe `partySize`, intervalo local/fecha de negocio,
`durationMinutes` y códigos de preferencia no sensibles allowlisted. Accesibilidad, allergy,
texto libre y Guest data nunca viajan en query. Devuelve slots con `startAt`, timezone,
duración, `asOf`, policy/input revisions, expiry, confidence/freshness y reason codes.

La misma ruta admite Membership interno o capability pública limitada a una sucursal. La
capability no cambia detalle, horizonte, límites ni granularidad de la respuesta. Inputs se
normalizan con límites de horizonte, duración, partySize, cantidad de slots y rate policy.

Es una consulta determinista sobre inputs versionados; no crea hold, reserva ni garantía. La
respuesta declara expiración/frescura y confirm siempre revalida contra el ledger de capacidad.
No expone Reservation, Guest ni causa identificable de indisponibilidad. Intervalos inválidos,
DST inexistente/ambiguo y party size fuera de política devuelven `422`.

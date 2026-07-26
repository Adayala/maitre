# Especificación — SPEC-074

`GET /v1/branches/{branchId}/availability` recibe hoy `partySize`, `startAt` UTC y
`durationMinutes`. El I0 actual no recibe fecha de negocio, ventana local ni preferencias
allowlisted. Devuelve una respuesta resumida con `startAt`, `timezone`, `durationMinutes`,
`asOf`, `freshness`, `available` y `freeTableIds`.

La misma ruta hoy sólo admite Membership interno autorizado; la variante pública anónima limitada a
sucursal queda definida pero diferida. Esa variante pública, cuando se materialice, será sólo de
consulta/discovery y no autorizará crear holds ni reservas. La creación de reservas requiere
cliente autenticado. Tampoco aplica aún normalización avanzada de horizonte, duración, partySize,
cantidad de slots ni rate policy.

Es una consulta live sobre reservas y ocupación vigentes; no crea hold, reserva ni garantía.
La respuesta expone frescura básica (`LIVE`) y confirm siempre revalida contra capacidad actual.
No expone Reservation ni Guest, pero el I0 sí devuelve `freeTableIds` internos y no informa
reason codes, expiry ni confidence. Inputs inválidos hoy devuelven `400`.

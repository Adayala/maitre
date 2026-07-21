# Contrato API — SPEC-074 Availability

`GET /v1/branches/{id}/availability` consulta partySize, date/window y preferences, devolviendo
slots con `asOf`, timezone, duration y capacidad estimada. Es una query, no reserva ni
garantía; confirmar vuelve a validar. Algoritmo recibe clock y reglas versionadas, aplica
salons/tables/occupancies/reservations/blocks sin exponer PII. Tests cubren DST, boundaries,
stale result, concurrency, party size y determinismo.

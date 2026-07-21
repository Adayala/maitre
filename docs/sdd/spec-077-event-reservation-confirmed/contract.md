# Contrato del evento — SPEC-077

`reservations.reservation.confirmed.v1` representa capacidad confirmada. Incluye IDs,
horario/duración, partySize, table assignment opcional, confirmedAt y aggregate revision;
sin contacto. Reconfirmaciones sólo publican nueva revisión lógica cuando cambia el hecho.
Consumidores convergen por revision. Tests cubren confirm race, duplicate, reordering,
outbox y payload mínimo.

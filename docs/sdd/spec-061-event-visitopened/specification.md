# Especificación — SPEC-061 VisitOpened

`floor.visit.opened.v1` por outbox tras crear Visit OPEN y Occupancies iniciales atómicamente.
Envelope SPEC-217 + visit/branch, guestCount, table IDs, reservation ref opcional, openedAt y
aggregate revision. Omite Guest/notes. Duplicados convergen; consumidores no recrean Occupancy.

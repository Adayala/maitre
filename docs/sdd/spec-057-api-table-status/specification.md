# Especificación — SPEC-057 Table Status API

GET por Branch/Salon y table devuelve proyección con status/reason, related ref redactada, source
revisions, cursor y `asOf`. Admite realtime/polling pero no writes.

Stale/lag se declara. Filtros no permiten inferir Guest. Toda acción sugerida lleva a command API que
revalida Occupancy/Reservation/blocks; nunca muta basado en esta vista.

# Reglas — SPEC-056

- Sólo una Occupancy ACTIVE por Table.
- Seat/move/release bloquea Tables en orden estable y es atómico.
- CLOSED no se reabre; intervalos históricos no se reescriben.
- Cierre parcial revalida capacity de la Visit.
- Tenant, Branch, actor y tiempos efectivos se derivan del contexto y del servidor.
- Los arrays de Tables son conjuntos no vacíos, sin duplicados y con tamaño acotado.
- `404` oculta scope, `409` expresa exclusión/capacidad, `412` revisión y `422` semántica.

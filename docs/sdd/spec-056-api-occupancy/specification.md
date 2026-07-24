# Especificación — SPEC-056 Occupancy API

Superficie I0:

- `GET /v1/visits/{visitId}/occupancies`;
- `GET /v1/visits/{visitId}/occupancies/{occupancyId}`;
- `POST /v1/visits/{visitId}/occupancies/seat`;
- `POST /v1/visits/{visitId}/occupancies/move`;
- `POST /v1/visits/{visitId}/occupancies/release`.

Lecturas incluyen ACTIVE e historia mediante filtros allowlisted y cursor estable. Mutaciones
son atómicas y bloquean Tables en orden estable; `If-Match` cubre Visit y el body declara el
mapa mínimo de revisiones esperadas de Occupancy/Table config. No acepta status, timestamps,
tenant ni Branch del cliente.

Conflicto de mesa activa devuelve `409` con reason no sensible; revisión obsoleta usa `412`.
Reintento devuelve el resultado previo.
Cerrar parcial revalida capacity; TableStatus se actualiza por outbox/proyección.

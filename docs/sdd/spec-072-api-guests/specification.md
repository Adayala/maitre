# Especificación — SPEC-072 Guests API

Superficie I0:

- `POST /v1/guests`;
- `GET /v1/guests/{guestId}`;
- `PATCH /v1/guests/{guestId}`;
- `POST /v1/guests/lookup`;
- `POST /v1/guests/{guestId}/anonymizations`;

El I0 actual es un subconjunto simple: perfil Guest tenant-scoped con `displayName`, `email`,
`phone`, `locale`, `consentGiven` y `notes`. Lookup es exacto por `email` o `phone`, requiere
`guest:pii_read` y no hace búsqueda parcial ni listado. `PATCH` no usa todavía `If-Match`.
No existen aún ContactPoints, consent evidence append-only, merge/unmerge, export async ni
workflow opaco de seguimiento.

Búsqueda y errores se mantienen tenant-scoped. No hay listados de Guests en este I0. Conflictos de
contacto no fusionan automáticamente personas ni se resuelven con alias/canonical identity.

`anonymizations` hoy es síncrono y devuelve `200` con el Guest ya anonimizado. La anonimización
limpia PII operativa del perfil, conserva el `guestId` y no elimina Reservation, Audit, Invoice
ni métricas agregadas referenciadas.

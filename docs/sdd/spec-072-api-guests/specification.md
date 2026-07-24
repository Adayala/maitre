# Especificación — SPEC-072 Guests API

Superficie I0:

- `POST /v1/guests`;
- `GET /v1/guests/{guestId}`;
- `PATCH /v1/guests/{guestId}`;
- `POST /v1/guests/lookup`;
- `POST /v1/guests/{guestId}/contact-points`;
- `PATCH /v1/guests/{guestId}/contact-points/{contactPointId}`;
- `DELETE /v1/guests/{guestId}/contact-points/{contactPointId}`;
- `POST /v1/guests/{guestId}/consent-evidence`;
- `POST /v1/guests/{sourceGuestId}/merge`;
- `POST /v1/guests/{guestId}/unmerge`;
- `POST /v1/guests/{guestId}/exports`;
- `POST /v1/guests/{guestId}/anonymizations`;
- `GET /v1/guest-workflows/{workflowId}`.

Crear/obtener Guest es tenant-scoped; lookup exacto por contacto normalizado requiere
`guest.pii.read`, no es una búsqueda parcial ni un listado.
- Rectificar perfil y ContactPoints usa `If-Match`. Consent evidence es append-only; cada
  purpose/channel conserva evidencia y versión independientes y una revocación no se expresa
  borrando registros.
- Merge exige source y target del mismo tenant, idempotency key y motivo; crea alias permanente y
  ledger reversible, sin reescribir snapshots históricos.
- Export entrega datos del sujeto y provenance de manera asíncrona, cifrada y con expiración.
- Anonymization inicia workflow: anonimiza PII operativa y conserva snapshots mínimos legalmente
  requeridos. No elimina Reservation, Audit, Invoice ni métricas agregadas.

Búsqueda y errores no permiten enumerar identidades cross-tenant. Listados redactan contacto por
default y bulk export se deniega salvo permiso separado, step-up authentication y auditoría.
Conflictos de contacto no fusionan automáticamente personas.

Export/anonymize devuelven `202` más workflow opaco. El artefacto exportado está cifrado,
expira y requiere capability de descarga de uso acotado; status y errores no exponen PII.

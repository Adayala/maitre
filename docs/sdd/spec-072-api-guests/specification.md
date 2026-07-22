# Especificación — SPEC-072 Guests API

- Crear y obtener Guest tenant-scoped; buscar por contacto normalizado requiere `guest.pii.read`.
- Rectificar perfil y consentimientos con `If-Match`; cada purpose/channel conserva evidencia y
  versión independientes.
- Merge exige source y target del mismo tenant, idempotency key y motivo; crea alias permanente y
  ledger reversible, sin reescribir snapshots históricos.
- Export entrega datos del sujeto y provenance de manera asíncrona, cifrada y con expiración.
- Delete inicia workflow: anonimiza PII operativa y conserva snapshots mínimos legalmente
  requeridos. No elimina Reservation, Audit, Invoice ni métricas agregadas.

Búsqueda y errores no permiten enumerar identidades cross-tenant. Listados redactan contacto por
default y bulk export se deniega salvo permiso separado, step-up authentication y auditoría.
Conflictos de contacto no fusionan automáticamente personas.

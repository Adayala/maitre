# Contrato API — SPEC-072 Guests

API tenant-scoped para buscar/crear/obtener/PATCH perfil Guest, consentimientos y merge
explícito. Búsqueda por contacto requiere permiso y normalización; no enumera coincidencias
cross-tenant. PATCH usa If-Match y separa opt-out de datos operativos. Merge es idempotente,
auditable y conserva aliases. Tests cubren PII redaction, duplicate contact, consent,
export/delete workflow y autorización.

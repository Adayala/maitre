# Contrato de evento — SPEC-168 ReviewReceived

Publicar cuando una reseña externa nueva o nueva versión queda persistida. El sobre versionado
incluye eventId, occurredAt, tenantId, branchId, externalReviewId, plataforma, changeType y
rating normalizado, sin autor ni texto. Tests cubren backfill, edición, borrado, duplicados,
reordenamiento, evolución compatible, provenance, correlación y aislamiento.

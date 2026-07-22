# Especificación — SPEC-168 ExternalReviewChanged

`feedback.external-review.changed.v1` para CREATE/UPDATE/TOMBSTONE. Incluye envelope, review/branch,
platform, change type, source version, rating normalized opcional, fetchedAt y freshness; omite texto
y autor. Duplicados/reordering convergen por external review version.

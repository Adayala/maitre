# Especificación — SPEC-168 ExternalReviewChanged

`feedback.external-review.changed.v1` para CREATE/UPDATE/TOMBSTONE. Incluye envelope, review/branch,
platform, change type, source version, rating normalized opcional, fetchedAt y freshness; omite texto
y autor. Duplicados/reordering convergen por external review version.

El evento puede ser consumido por read models, agregadores reputacionales y alertas operativas. No
debe interpretarse como garantía de frescura infinita: `freshness` y `fetchedAt` siguen siendo parte
del contrato. Un `TOMBSTONE` comunica que el origen remoto dejó de ofrecer la reseña o que la política
contractual exige retirarla localmente.

La identidad lógica de convergencia combina `externalReviewId`, `sourceVersion` y `changeType`
efectivo. Consumers deben ser tolerantes a entrega at-least-once y a recepción tardía de versiones
viejas, descartándolas por versionado en lugar de asumir orden total perfecto.

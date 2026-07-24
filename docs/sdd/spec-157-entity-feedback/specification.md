# Especificación — SPEC-157 Feedback

Feedback separa contenido, subject refs e identidad/contacto cifrado opcional. Cada campo declara
purpose, treatment basis/consent version, retention class y visibility.

Case lifecycle: `OPEN -> TRIAGED -> ACTION_REQUIRED | NO_ACTION -> RESOLVED`; RESOLVED puede
`REOPEN` con reason. `REDACTED` es estado de contenido, no cierre del caso. Asignar, resolver,
reabrir o redactar usa expected revision y audit. Redacción preserva hash/provenance y no afirma
borrado en una plataforma externa.

La entidad incluye `feedbackId`, `tenantId`, `brandId?`, `branchId?`, `channel`, `subjectRefs`,
`content`, `contentStatus`, `identityRef?`, `caseStatus`, `assignee?`, `triageReason?`,
`resolutionReason?`, `reopenReason?`, `purpose`, `treatmentBasis`, `consentVersion?`,
`retentionClass`, `visibility`, `createdAt`, `updatedAt` y `revision`. La identidad opcional queda
aislada de agregados y de consumidores sin permiso explícito.

`content` puede contener texto libre, attachments referenciados y metadata estructurada, siempre bajo
políticas de retención y visibilidad. Cambios sustanciales del contenido crean nueva revisión; el
histórico no desaparece aunque el contenido actual quede redactado o suprimido para vistas generales.

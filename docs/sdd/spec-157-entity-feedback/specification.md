# Especificación — SPEC-157 Feedback

Feedback separa contenido, subject refs e identidad/contacto cifrado opcional. Cada campo declara
purpose, treatment basis/consent version, retention class y visibility.

Case lifecycle: `OPEN -> TRIAGED -> ACTION_REQUIRED | NO_ACTION -> RESOLVED`; RESOLVED puede
`REOPEN` con reason. `REDACTED` es estado de contenido, no cierre del caso. Asignar, resolver,
reabrir o redactar usa expected revision y audit. Redacción preserva hash/provenance y no afirma
borrado en una plataforma externa.

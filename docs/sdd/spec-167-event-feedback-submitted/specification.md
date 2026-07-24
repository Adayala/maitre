# Especificación — SPEC-167 FeedbackSubmitted

`feedback.feedback.submitted.v1` por outbox al aceptar Feedback. Envelope SPEC-217 + IDs de
feedback/sucursal, channel, dimension codes, purpose codes y revisión agregada. Omite texto, contacto, author,
consent proof y capability token. Consumidores consultan contenido sólo con permiso y purpose.

El evento es at-least-once y se deduplica por `feedbackId + aggregateRevision + eventType`. Su
semántica es “feedback aceptado por el sistema”, no “feedback ya triageado” ni “feedback visible para
toda audiencia”. El evento puede activar colas de análisis, notificaciones internas o métricas, pero
sin transportar contenido sensible.

Una nueva revisión del feedback no vuelve a emitir SPEC-167 salvo que exista una nueva aceptación
lógica del agregado prevista por el ciclo de vida. Actualizaciones posteriores del caso se modelan con otros
eventos o con reconsulta directa, no con reuso ambiguo de “submitted”.

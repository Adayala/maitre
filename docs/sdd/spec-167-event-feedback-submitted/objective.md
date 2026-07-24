# Objetivo — SPEC-167

Definir el evento de aceptación de feedback como señal mínima y segura para la privacidad de consumidores
downstream.

## Criterios de aceptación

### CAD-167-01 — El nombre canónico del evento es `feedback.feedback.submitted.v1`

el nombre canónico del evento es `feedback.feedback.submitted.v1`.

### CAD-167-02 — Se emite por outbox sólo cuando Feedback es aceptado y persistido

se emite por outbox únicamente cuando un Feedback es aceptado y persistido.

### CAD-167-03 — El payload incluye refs, channel, dimension codes, purpose y revisión

el payload incluye envelope común, refs de feedback/sucursal, channel, dimension codes, purpose
codes y revisión agregada.

### CAD-167-04 — El payload omite texto, contacto, author, consent proof y capability token

el payload omite texto, contacto, author, consent proof y capability token.

### CAD-167-05 — El evento no habilita acceso al contenido; requiere reconsulta autorizada

consumidores que necesiten contenido deben reconsultar bajo permiso y purpose válidos; el
evento por sí solo no habilita acceso al texto.

### CAD-167-06 — La aprobación exige evidencia de naming, outbox, deduplicación y revisiones

La aprobación exige fixtures de naming, outbox, redacción, deduplicación, orden y
revisiones.

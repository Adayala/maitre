# Verificación — SPEC-167

## Criterios

### CAD-167-01 — El nombre canónico del evento es `feedback.feedback.submitted.v1`

- [ ] el nombre canónico es `feedback.feedback.submitted.v1`.

### CAD-167-02 — Se emite por outbox sólo cuando Feedback es aceptado y persistido

- [ ] el evento se publica sólo al aceptar/persistir Feedback.

### CAD-167-03 — El payload incluye refs, channel, dimension codes, purpose y revisión

- [ ] el payload contiene refs, channel, dimension codes, purpose y revisión.

### CAD-167-04 — El payload omite texto, contacto, author, consent proof y capability token

- [ ] texto, contacto, author, consent proof y capability token quedan fuera.

### CAD-167-05 — El evento no habilita acceso al contenido; requiere reconsulta autorizada

- [ ] acceso al contenido requiere reconsulta bajo permisos válidos.

### CAD-167-06 — La aprobación exige evidencia de naming, outbox, deduplicación y revisiones

- [ ] fixtures cubren naming, outbox, deduplicación y redacción.

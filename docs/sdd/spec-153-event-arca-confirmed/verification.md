# Verificación — SPEC-153

## Criterios

### CAD-153-01 — El nombre canónico del evento técnico es `fiscal.authorization.resolved.v1`

- [ ] el nombre canónico del evento técnico es `fiscal.authorization.resolved.v1`.

### CAD-153-02 — El evento cubre respuestas directas y reconciliaciones ambiguas

- [ ] el evento cubre respuestas directas y reconciliaciones ambiguas.

### CAD-153-03 — El payload incluye IDs, outcome, códigos y causation sin raw payloads

- [ ] payload incluye operación, outcome, códigos y causation sin raw payloads.

### CAD-153-04 — El evento omite SOAP, credentials, secretos y PII

- [ ] SOAP, credentials, secretos y PII quedan fuera.

### CAD-153-05 — Si outcome es `AUTHORIZED`, además emite SPEC-152 sin doble contabilización

- [ ] autorizaciones resueltas emiten además SPEC-152 y no duplican contabilidad.

### CAD-153-06 — La aprobación exige evidencia de timeout ambiguo, rejected y ordering

- [ ] fixtures cubren ordering, rejected, timeout ambiguo y redaction.

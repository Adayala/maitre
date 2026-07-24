# Objetivo — SPEC-153

Definir el evento técnico que cierra una operación de autorización externa sin convertirlo en hecho
contable downstream.

## Criterios de aceptación

### CAD-153-01 — El nombre canónico del evento técnico es `fiscal.authorization.resolved.v1`

el nombre canónico del evento técnico es `fiscal.authorization.resolved.v1`.

### CAD-153-02 — El evento cubre respuestas directas y reconciliaciones ambiguas

el evento cubre tanto operaciones directas como reconciliaciones ambiguas contra el
proveedor fiscal.

### CAD-153-03 — El payload incluye IDs, outcome, códigos y causation sin raw payloads

el payload incluye operation/invoice IDs, provider, environment, outcome, normalized
codes, resolvedAt y causation sin incluir payloads raw.

### CAD-153-04 — El evento omite SOAP, credentials, secretos y PII

el evento omite SOAP, credentials, secretos y PII.

### CAD-153-05 — Si outcome es `AUTHORIZED`, además emite SPEC-152 sin doble contabilización

si el outcome es `AUTHORIZED`, la misma transición de dominio emite además SPEC-152;
consumidores contables ignoran SPEC-153 para evitar doble contabilización.

### CAD-153-06 — La aprobación exige evidencia de timeout ambiguo, rejected y ordering

La aprobación exige fixtures de direct response, timeout ambiguo, rejected, ordering con
SPEC-152 y redaction.

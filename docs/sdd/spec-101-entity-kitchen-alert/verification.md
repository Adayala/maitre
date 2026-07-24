# Verificación — SPEC-101

## Criterios

### CAD-101-01 — Rule version, fingerprint e historial no reabren activaciones previas

- [ ] rule version, fingerprint y activations no reabren historia previa.

### CAD-101-02 — El lifecycle OPEN/ACKNOWLEDGED/RESOLVED es inequívoco

- [ ] lifecycle y escalación separada son consistentes y auditables.

### CAD-101-03 — Evidencia, ventanas y severidad se modelan determinísticamente

- [ ] evidence windows, thresholds y severidad producen detección determinística.

### CAD-101-04 — Dedupe y reactivación preservan trazabilidad completa

- [ ] dedupe y nueva activation tras resolución preservan trazabilidad.

### CAD-101-05 — KitchenAlert omite PII y no gobierna mutaciones de Command

- [ ] alertas omiten PII y no gobiernan mutaciones de Command.

### CAD-101-06 — La aprobación exige evidencia de threshold, dedupe y escalation

- [ ] fixtures cubren clock, dedupe, escalation, ack race y rebuild.

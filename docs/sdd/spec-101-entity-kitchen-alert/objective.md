# Objetivo — SPEC-101

Definir KitchenAlert como activation operativa versionada y deduplicable derivada de reglas/SLA, no
como autoridad de Command.

## Criterios de aceptación

### CAD-101-01 — Rule version, fingerprint e historial no reabren activaciones previas

rule version, fingerprint y activation history quedan definidos sin reabrir historia previa.

### CAD-101-02 — El lifecycle OPEN/ACKNOWLEDGED/RESOLVED es inequívoco

lifecycle OPEN/ACKNOWLEDGED/RESOLVED con escalación separada es inequívoco.

### CAD-101-03 — Evidencia, ventanas y severidad se modelan determinísticamente

evidencia, ventanas temporales, thresholds y severidad se modelan de forma determinística.

### CAD-101-04 — Dedupe y reactivación preservan trazabilidad completa

dedupe y nueva activation tras resolución conservan trazabilidad completa.

### CAD-101-05 — KitchenAlert omite PII y no gobierna mutaciones de Command

la alerta omite PII y no se usa como fuente autoritativa para mutar Commands.

### CAD-101-06 — La aprobación exige evidencia de threshold, dedupe y escalation

La aprobación exige fixtures de threshold, clock, dedupe, escalation, ack race, rebuild y
aislamiento.

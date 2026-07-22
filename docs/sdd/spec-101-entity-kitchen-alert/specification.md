# Especificación — SPEC-101 KitchenAlert

Cada regla versionada define clock, evidence window, threshold, severity y fingerprint
`tenant + branch + rule + subject + window`. La primera detección crea una activation OPEN;
repeticiones en la misma ventana agregan evidencia. Una condición posterior a RESOLVED crea nueva
activation; no reabre ni muta historia.

Lifecycle: `OPEN -> ACKNOWLEDGED -> RESOLVED`; `OPEN|ACKNOWLEDGED -> ESCALATED` conserva el estado
operativo más flag/escalation level. Commands usan expected revision e idempotencia. La alerta no
es autoridad de Command y omite PII.

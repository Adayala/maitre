# Contrato — SPEC-101 KitchenAlert

KitchenAlert es señal operativa derivada de SLA/reglas: type, severity, station/command refs,
detectedAt/openedAt, status `OPEN | ACKNOWLEDGED | ESCALATED | RESOLVED`, refs operativas y
auditoría mínima. I0 no materializa rule versions, fingerprint/evidence window ni un motor de
reglas configurable: sólo dos thresholds hardcodeados evaluados on-demand. La detección repetida
deduplica mientras exista una `OPEN` para el mismo `commandId + ruleCode`; una alerta resuelta no
se reabre. `acknowledge` no resuelve causa; `resolve` exige `reasonCode`; `escalate` incrementa
`escalationLevel`. Tests cubren threshold, dedupe, lifecycle y terminalidad.

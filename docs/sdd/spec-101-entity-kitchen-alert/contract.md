# Contrato — SPEC-101 KitchenAlert

KitchenAlert es señal operativa derivada de SLA/reglas: type, severity, station/command refs,
detectedAt, status `OPEN | ACKNOWLEDGED | RESOLVED`, dedupe key y auditoría. No contiene PII
ni se usa como fuente del Command. Detección repetida deduplica/actualiza evidencia;
acknowledge no resuelve causa. Resolución automática/humana registra reason. Tests cubren
threshold, clock, dedupe, escalation, ack race y rebuild.

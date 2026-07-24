# Especificación — SPEC-190 Alert

AlertRule versionada define metric, condition, evidence window, severity, owner, runbook, cooldown,
suppression y recipients. Activation fingerprint = tenant+rule+subject+window.

Lifecycle `OPEN -> ACKNOWLEDGED -> RESOLVED | DISMISSED`; nueva condición tras RESOLVED crea
activation nueva. Snooze no resuelve. Datos stale/insuficientes producen UNKNOWN y no notifican ni
automatizan. Dedupe/cooldown agregan occurrences y evitan fatiga conservando evidencia.

La entidad `AlertRule` incluye `alertRuleId`, `metricRef`, `conditionDsl`, `evidenceWindow`,
`severity`, `owner`, `runbookRef`, `cooldownPolicy`, `suppressionPolicy`, `recipientPolicy`,
`status`, `version` y `revision`. La activación `Alert` incluye `alertId`, `ruleRef`, `fingerprint`,
`subjectRef?`, `windowRef`, `status`, `occurrenceCount`, `lastObservedAt`, `acknowledgedBy?`,
`resolvedAt?`, `dismissedReason?` y `revision`.

`UNKNOWN` representa falta de señal suficiente o confianza operativa; no debe colapsarse en `OPEN` ni
en `RESOLVED`. Esto evita notificaciones o automatizaciones basadas en datos stale o incompletos.

# Especificación — SPEC-190 Alert

AlertRule versionada define metric, condition, evidence window, severity, owner, runbook, cooldown,
suppression y recipients. Activation fingerprint = tenant+rule+subject+window.

Lifecycle `OPEN -> ACKNOWLEDGED -> RESOLVED | DISMISSED`; nueva condición tras RESOLVED crea
activation nueva. Snooze no resuelve. Datos stale/insuficientes producen UNKNOWN y no notifican ni
automatizan. Dedupe/cooldown agregan occurrences y evitan fatiga conservando evidencia.

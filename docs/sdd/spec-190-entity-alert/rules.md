# Reglas — SPEC-190

- AlertRule es versionada.
- Fingerprint = tenant + rule + subject + window.
- Snooze no resuelve.
- `UNKNOWN` no notifica ni automatiza.
- Cooldown/dedupe agregan occurrences sin perder evidencia.

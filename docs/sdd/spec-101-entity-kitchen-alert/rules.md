# Rules — SPEC-101

- Fingerprint deduplica dentro de ventana configurada por regla.
- Repeticiones agregan evidencia; no reabren activations resueltas.
- `ACKNOWLEDGED` no equivale a `RESOLVED`.
- Escalation es dimensión adicional, no sustituto del estado principal.
- Alertas omiten PII y no autorizan cambios sobre Commands por sí mismas.

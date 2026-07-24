# Objetivo — SPEC-201

Definir Maitre Rewind como resumen retrospectivo seguro, citando evidencia autorizada y separando
hechos de inferencias.

## Criterios de aceptación

### CAD-201-01 — El context builder recupera sólo datos autorizados tras aplicar alcance y privacidad

El context builder recupera sólo DataRegistry/metrics autorizados después de aplicar tenant/alcance,
classification y privacy threshold.

### CAD-201-02 — Las fuentes se serializan como datos y no como instrucciones

Las fuentes se serializan como datos y no como instrucciones ejecutables.

### CAD-201-03 — La salida separa hechos e inferencias y cita evidencia sin inventar causalidad

La salida separa hechos e inferencias, cita refs con período/freshness/coverage y no inventa causalidad.

### CAD-201-04 — Prompt injection, secrets, PII y exfiltration se filtran antes y después del modelo

Prompt injection, secrets/PII y output exfiltration se filtran antes y después del modelo.

### CAD-201-05 — Existe fallback determinista y modo fallback-only sin PASS gate

Existe fallback determinista que genera resumen sin LLM y si runtime/model no tiene eval + cost/privacy
spike `PASS`, la superficie queda fallback-only.

### CAD-201-06 — La aprobación exige evidencia de retrieval, citas, redacción, injection y fallback

La aprobación exige fixtures de retrieval autorizado, citas, separación hechos-vs-inferencias, prompt
injection, redacción y fallback-only mode.

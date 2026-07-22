# Especificación — SPEC-201 Maitre Rewind

Context builder recupera sólo DataRegistry/metrics autorizados después de aplicar tenant/scope,
classification y privacy threshold. Fuentes se serializan como datos no instrucciones.

Salida separa facts/inferences, cita refs + period/freshness/coverage y nunca inventa causalidad. Se
filtran prompt injection, secrets/PII y output exfiltration. Fallback determinista genera resumen
sin LLM. Runtime/model requiere eval y cost/privacy spike PASS; si no, queda fallback-only.

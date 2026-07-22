# Especificación — SPEC-202 Maitre Live

Resume estado operativo con `asOf`, projection lag, alerts y suggested actions sin ejecutarlas.
Reglas deterministas priorizan severidad; LLM sólo redacta sobre contexto autorizado/estructurado.

Datos stale/contradictorios producen degraded summary y bloquean action suggestion. Tool outputs son
untrusted; no amplían scopes. Fallback muestra alerts/metrics directas. Eval cubre injection,
latency, utilidad, fidelidad y aislamiento antes de habilitar modelo.

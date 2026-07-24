# Especificación — SPEC-202 Maitre Live

Resume estado operativo con `asOf`, projection lag, alerts y suggested actions sin ejecutarlas.
Reglas deterministas priorizan severidad; LLM sólo redacta sobre contexto autorizado/estructurado.

Datos stale/contradictorios producen degraded summary y bloquean action suggestion. Tool outputs son
untrusted; no amplían scopes. Fallback muestra alerts/metrics directas. Eval cubre injection,
latency, utilidad, fidelidad y aislamiento antes de habilitar modelo.

La surface trabaja sobre proyecciones y alertas ya materializadas, no sobre mutaciones en vivo. El
resumen puede priorizar, agrupar y explicar, pero no inventar nuevas acciones ejecutables ni inferir
acceso adicional a evidencia fuera del contexto autorizado.

El modelo generativo, si existe, ocupa un rol de presentación asistiva. La lógica de severidad,
degradación y bloqueo por stale/contradictorio permanece determinística y auditable.

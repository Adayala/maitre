# Objetivo — SPEC-202

Definir Maitre Live como resumen operativo en tiempo casi real, asistivo y bloqueado frente a señales
stale o contradictorias.

## Criterios de aceptación

### CAD-202-01 — Resume estado operativo con `asOf`, lag, alerts y suggested actions sin ejecutarlas

Resume estado operativo con `asOf`, projection lag, alerts y suggested actions sin ejecutarlas.

### CAD-202-02 — Reglas deterministas priorizan severidad y el LLM sólo redacta sobre contexto autorizado

Reglas deterministas priorizan severidad y el LLM sólo redacta sobre contexto autorizado/estructurado.

### CAD-202-03 — Datos stale o contradictorios producen degraded summary y bloquean sugerencias

Datos stale o contradictorios producen degraded summary y bloquean action suggestion.

### CAD-202-04 — Tool outputs son untrusted y no amplían scopes

Tool outputs son untrusted y no amplían scopes.

### CAD-202-05 — Existe fallback directo y el modelo sólo se habilita con evaluaciones aprobadas

Existe fallback que muestra alerts/metrics directas; habilitar modelo exige eval de injection,
latency, utilidad, fidelidad y aislamiento.

### CAD-202-06 — La aprobación exige evidencia de lag, stale handling, tools untrusted y fallback

La aprobación exige fixtures de lag/asOf, stale handling, untrusted tools, degraded summary, action
suggestion blocking y fallback.

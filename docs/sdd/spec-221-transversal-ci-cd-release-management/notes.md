# Decisiones — SPEC-221

## Decisiones

- Trunk-based reduce drift y branches de ambiente durante un MVP pequeño.
- Conventional Commits aporta historial legible y permite versionado/changelog futuro sin imponerlo desde el primer día.
- Vercel puede construir previews, pero la verificación permanece ejecutable fuera de Vercel.
- Forward-only + expand/contract evita confiar en down migrations destructivas.
- Demo se promueve manualmente porque estabilidad y cuota importan más que desplegar cada merge.
- Production no es un destino configurado hasta completar gates explícitos.

## Métricas de entrega

- lead time desde commit hasta ambiente;
- deployment frequency;
- change failure rate;
- mean time to restore;
- duración/flake rate de CI;
- consumo de minutos y storage;
- porcentaje de releases con rollback ensayado/evidencia completa.

## Preguntas antes de producción

- estrategia de canary/traffic shifting disponible en plataforma elegida;
- separación de responsabilidades y aprobadores;
- firma/provenance/SBOM requerida;
- ventanas fiscales y operativas sin despliegue;
- soporte/on-call y comunicación con restaurantes;
- automatización de changelog y release notes públicas.

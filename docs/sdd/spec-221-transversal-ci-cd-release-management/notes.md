# Decisiones — SPEC-221

## Decisiones

- Trunk-based reduce drift y branches de ambiente durante un MVP pequeño.
- Conventional Commits aporta historial legible y permite versionado/changelog futuro sin imponerlo desde el primer día.
- Vercel puede construir previews, pero la verificación permanece ejecutable fuera de Vercel.
- Forward-only + expand/contract evita confiar en down migrations destructivas.
- Demo promueve manualmente un Production build staged; promover Preview provocaría rebuild con variables Production.
- Production no es un destino configurado hasta completar gates explícitos.
- Vercel llama Production al target que Maitre usa como `demo`; `APP_ENV` evita confundirlos.
- Vercel Hobby puede rechazar deployments de commits cuyo autor no sea owner del Hobby team. Debe auditarse antes de incorporar contribución directa de varias personas.

## Fuentes verificadas 2026-07-21

- [Vercel: promoting deployments](https://vercel.com/docs/deployments/promoting-a-deployment)
- [Vercel: Git deployments y restricciones Hobby](https://vercel.com/docs/git)
- [GitHub: protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

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

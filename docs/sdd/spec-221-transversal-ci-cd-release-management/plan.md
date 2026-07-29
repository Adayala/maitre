# Plan — SPEC-221

## Fase 1 — Integración

1. Auditar visibilidad/plan, branch protection y ownership Vercel/GitHub.
2. Definir Conventional PR title + squash merge.
3. [Parcial] Crear workflows de Quality, CodeQL, E2E y deploy; falta el check agregador.
4. [Implementado] Configurar cache, concurrency y selección conservadora por impacto.
5. [Parcial] Publicar coverage/SBOM y metadata por SHA; falta inventario unificado de releases.

## Fase 2 — Deploy

1. [Parcial] Conectar deploy desde `main` a Vercel; faltan Preview y promoción staged sin rebuild.
2. Deshabilitar auto-asignación de dominio y probar promoción sin rebuild.
3. Implementar smoke/synthetic post-deploy.
4. Automatizar expiración de previews.

## Fase 3 — Datos y rollback

1. Crear migration job separado, manual/autorizado y sin ejecución desde Preview.
2. Probar expand/migrate/contract.
3. Crear inventario de artefactos/config compatibles.
4. Ensayar rollback, roll-forward y reconciliación.

## Fase 4 — Gobierno

1. Crear template/checklist de release.
2. Integrar SLO/error budget, seguridad y DR.
3. Medir lead time, failure rate y recovery time.
4. Probar release de emergencia mediante ejercicio seguro.

# Plan — SPEC-221

## Fase 1 — Integración

1. Definir branch protection y Conventional Commits.
2. Crear workflows reutilizables y checks agregadores.
3. Configurar cache/concurrency/path impact seguros.
4. Publicar reportes y metadata por SHA.

## Fase 2 — Deploy

1. Conectar preview y development a Vercel.
2. Configurar promoción aprobada a demo.
3. Implementar smoke/synthetic post-deploy.
4. Automatizar expiración de previews.

## Fase 3 — Datos y rollback

1. Crear migration job separado.
2. Probar expand/migrate/contract.
3. Crear inventario de artefactos/config compatibles.
4. Ensayar rollback, roll-forward y reconciliación.

## Fase 4 — Gobierno

1. Crear template/checklist de release.
2. Integrar SLO/error budget, seguridad y DR.
3. Medir lead time, failure rate y recovery time.
4. Probar release de emergencia mediante ejercicio seguro.

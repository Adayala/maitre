# Plan — SPEC-214

## Fase 1 — Contrato

1. Aprobar `configuration-inventory.md` como contrato sin valores.
2. Clasificar browser, server, migración y CI.
3. Implementar schemas Zod y entrypoints separados.
4. Crear `.env.example` y chequeo de drift.

## Fase 2 — Ambientes

1. Configurar local/test sin secretos reales.
2. Mapear preview, development y demo en Vercel/Supabase según el target inicial.
3. Separar credenciales de runtime, migración y administración.
4. Verificar límites de acceso y datos sintéticos, sin credenciales de migración en Preview.

## Fase 3 — Seguridad y operación

1. Configurar secret scanning y revisión de bundles/artefactos.
2. Documentar owners, rotación, revocación y recuperación.
3. Implementar runbook de promoción y rollback.
4. Simular secreto expuesto usando un valor canario revocable.

## Fase 4 — Gate

1. Desplegar el mismo commit en preview y demo con distinta configuración.
2. Ejecutar smoke tests y readiness.
3. Inspeccionar bundle, logs y artefactos.
4. Adjuntar evidencia al gate de SPEC-213.

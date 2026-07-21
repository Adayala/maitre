# Plan — SPEC-225

## Fase 1 — Registro

1. Aprobar estados, metadata y owners.
2. Auditar IDs/slugs/duplicados existentes. Primera auditoría documental completada; remediación pendiente.
3. Generar catálogo machine-readable e índices desde metadata autoritativa.
4. Definir proceso de asignación de IDs.
5. Normalizar estados compuestos separando estado, readiness y blockers.
6. Migrar metadata histórica por lotes de dominio sin inferir aprobación.

## Fase 2 — Validación

1. Implementar `npm run sdd:validate` según `validation-contract.md`.
2. Validar archivos, metadata, links y dependencias.
3. Integrar Markdown/whitespace y catálogo.
4. Añadir fixtures de specs válidas/inválidas.
5. Generar y revisar la línea base histórica antes de activarla en CI.

## Fase 3 — Readiness P0

1. Revisar SPEC-207–225 según esta política.
2. Resolver contradicciones/preguntas P0.
3. Crear ADRs de stack, datos y realtime.
4. Aprobar sólo el conjunto necesario para SPEC-222 I0.

## Fase 4 — Operación

1. Integrar template/checklist a PRs.
2. Enlazar issues/tests/releases.
3. Medir drift, tiempo de review y cambios reabiertos.
4. Deprecar/superseder documentación antigua de forma explícita.

# Plan — SPEC-220

## Fase 1 — Inventario y objetivos

1. Inventariar DB, objetos, identidad, secretos y datos regenerables.
2. Aprobar RPO/RTO de development y demo.
3. Crear matriz de retención/borrado inicial.
4. Elegir destino cifrado fuera del failure domain.

## Fase 2 — Automatización

1. Implementar dump + cifrado + hash + manifest.
2. Implementar manifest/export de objetos.
3. Automatizar políticas de retención sin borrar la última copia válida.
4. Instrumentar edad, tamaño, error y expiración.

## Fase 3 — Restore

1. Crear runbook y ambiente aislado de restauración.
2. Restaurar DB, objetos e identidad/configuración recuperable.
3. Ejecutar checks de integridad, RLS y E2E.
4. Medir RPO/RTO y corregir pasos manuales.

## Fase 4 — Continuidad

1. Simular proveedor/base/credencial comprometidos.
2. Probar reconciliación de outbox, pagos y ARCA con fixtures.
3. Probar tombstones/borrados tras restore.
4. Definir gate productivo y triggers de upgrade/migración.

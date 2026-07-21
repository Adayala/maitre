# Plan — SPEC-220

## Fase 1 — Inventario y objetivos

1. Aprobar `i0-recovery-profile.md` e inventario regenerable.
2. Mantener RPO/RTO como hipótesis hasta medir SPK-06.
3. Crear matriz de retención/borrado inicial.
4. Elegir destino cifrado durable sólo antes de datos no regenerables.

## Fase 2 — Automatización

1. Implementar harness temporal dump + cifrado + hash + manifest para SPK-06.
2. Rebuild desde migraciones/seed y recreación Auth sintética.
3. Probar restore/integridad y cleanup del artefacto temporal.
4. Posponer retención/monitoring hasta seleccionar destino durable.

## Fase 3 — Restore

1. Crear runbook y ambiente aislado de restauración.
2. Restaurar DB y recrear identidad/configuración sintética; objetos sólo si el spike los usa.
3. Ejecutar checks de integridad, RLS y E2E.
4. Medir RPO/RTO y corregir pasos manuales.

## Fase 4 — Continuidad

1. Simular proveedor/base/credencial comprometidos.
2. Probar reconciliación de outbox, pagos y ARCA con fixtures.
3. Probar tombstones/borrados tras restore.
4. Definir gate productivo y triggers de upgrade/migración.

# Plan — SPEC-218

## Fase 1 — Política

1. Aprobar matriz offline por app/comando.
2. Definir grant offline, expiración y riesgo de dispositivo.
3. Definir IDs y conflictos para Order/KitchenTicket.
4. Crear schemas de bootstrap, command y sync result.

## Fase 2 — Persistencia local

1. Implementar `LocalStorePort` con IndexedDB.
2. Crear migraciones, partición y control de cuota.
3. Implementar command journal y proyecciones.
4. Probar reload, crash, upgrade y storage pressure.

## Fase 3 — Sincronización

1. Implementar bootstrap y pull incremental.
2. Implementar batch push e idempotencia server-side.
3. Implementar orden causal, mapping y resultados parciales.
4. Implementar conflictos, blocked y retry estable.

## Fase 4 — Experiencia y piloto

1. Implementar estados y acciones de recuperación.
2. Configurar service worker/cache seguro.
3. Ejecutar pruebas multi-device y cortes reales.
4. Medir convergencia, errores, cuota y soporte requerido.

# Plan — SPEC-223

## Fase 1 — Proyecciones

1. Aprobar scopes, payloads y freshness por app.
2. Implementar versiones/ETag y endpoints de proyección.
3. Crear cliente de polling abortable/adaptativo.
4. Implementar estados live/updating/stale/degraded.

## Fase 2 — Convergencia

1. Refetch después de comandos.
2. Probar gaps, duplicados, desorden y reconnect.
3. Integrar offline/cambio de contexto/multi-tab.
4. Instrumentar latencia end-to-end y cuota.

## Fase 3 — Decisión de transporte

1. Ejecutar demo Floor/Kitchen con concurrencia representativa.
2. Comparar SLO y consumo de polling.
3. Si falla el umbral, spike de Supabase private Broadcast.
4. Registrar ADR go/no-go y fallback.

## Fase 4 — Pilot readiness

1. Probar auth/revocación de topics.
2. Ejecutar desconexión/reconexión prolongada.
3. Proyectar límites con usuarios/dispositivos del piloto.
4. Aprobar SLO, alertas y runbook.

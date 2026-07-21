# Reglas — SPEC-223

## Invariantes

1. Mensajes realtime son hints; estado autoritativo proviene de API/sync validada.
2. Pérdida, duplicación o desorden converge mediante versión y refetch.
3. Cada proyección/topic está tenant/branch/role scoped.
4. Browser no recibe service role ni cambios crudos de tablas como contrato.
5. Polling nunca solapa requests para la misma vista.
6. Background/offline reduce o detiene actividad.
7. Comando confirmado dispara refresh sin esperar el siguiente intervalo.
8. Push posee fallback a polling.
9. Freshness/staleness se comunica cuando afecta decisiones.
10. Realtime no reemplaza outbox, idempotencia ni offline sync.
11. Topics y métricas no exponen PII.
12. Adoptar un transporte persistente requiere evidencia de latencia y cuota.

## Prohibiciones

- Public channels para Floor, Kitchen, Cash o Dash.
- Usar presencia como fuente autoritativa de turnos/usuarios.
- Aplicar last-write-wins desde un mensaje.
- Polling con intervalos rígidos idénticos y sin backoff/jitter.
- Mostrar éxito de negocio por recibir un hint.

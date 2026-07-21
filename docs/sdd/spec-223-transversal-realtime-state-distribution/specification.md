# Especificación — SPEC-223

## 1. Modelo de consistencia

```text
Command accepted
  → transaction + outbox
  → authoritative projection/version
  → change hint (poll response or push)
  → client invalidates/refetches
  → UI converges to authorized state
```

La notificación no contiene autoridad suficiente para confirmar una transición crítica. El cliente aplica datos sólo desde una response/sync validada o desde un mensaje versionado cuyo contrato lo permita explícitamente.

## 2. Transporte inicial

MVP Demo usa HTTP conditional polling:

- endpoints de proyección optimizados por app/contexto;
- `ETag`/`If-None-Match` o cursor/version estable;
- `304 Not Modified` sin body cuando no cambió;
- requests abortables y sin solapamiento por vista;
- jitter para evitar thundering herd;
- backoff ante error/429/503;
- refetch inmediato después de comando local confirmado.

Intervalos propuestos, sujetos a medición:

| Contexto | Visible/activo | Inactivo/background |
| --- | --- | --- |
| Kitchen | 2–3 s | 15–30 s o pausa |
| Floor | 3–5 s | 15–30 s o pausa |
| Cash | 5–10 s | pausa salvo operación activa |
| Dash | 15–30 s | pausa |

Offline detiene polling y delega convergencia a SPEC-218. Volver visible o reconectar dispara refresh con deduplicación.

## 3. Proyecciones operativas

Las APIs entregan vistas explícitas:

- Floor: mesas/visitas/pedidos activos autorizados;
- Kitchen: tickets/ítems por branch y station;
- Cash: cuentas/estado de pago autorizados;
- Dash: agregados con freshness visible.

Una proyección incluye:

- `version` o cursor monotónico dentro de su scope;
- `generatedAt` del servidor;
- datos mínimos necesarios;
- estado de degradación cuando una fuente no está disponible;
- correlation metadata de SPEC-215.

No se obtiene una tabla completa para filtrar permisos en browser.

## 4. Contrato de change hint

Un transporte push opcional usa hints pequeños:

```json
{
  "messageId": "01J...",
  "topic": "branch:branch_...:kitchen:station_...",
  "kind": "KitchenProjectionChanged",
  "scopeVersion": 128,
  "occurredAt": "2026-07-21T18:30:00.000Z",
  "correlationId": "01J..."
}
```

- No contiene payload completo de pedido, PII o datos fiscales.
- Duplicados se ignoran por messageId/version.
- Version mayor a la esperada dispara refetch; gaps no se rellenan desde el hint.
- Version menor/igual es stale/duplicate.
- Topic se deriva server-side de contexto autorizado.

## 5. Autorización

- Una suscripción requiere sesión válida.
- El topic se autoriza por user, tenant, branch, role, entitlement y station/assignment.
- El cliente no puede ampliar scope construyendo otro nombre de topic.
- Revocar membership/rol invalida acceso en la siguiente verificación y fuerza cierre/reautorización del canal.
- Canales son privados; public channels quedan prohibidos para operación interna.
- Service role/secret key nunca llega al browser.
- Policies y tests cubren conexión, recepción y publicación no autorizadas.

## 6. Supabase Realtime opcional

Si medición demuestra que polling no cumple latencia/cuota:

- `SupabaseRealtimeAdapter` implementa `RealtimeTransportPort` en frontend/infraestructura;
- canales Broadcast son privados y usan Realtime Authorization/RLS;
- servidor/outbox publica hints de dominio/proyección;
- browser no publica comandos operativos por Broadcast;
- Postgres Changes crudos no son API pública ni modelo de UI;
- versión, reconexión y refetch siguen siendo independientes del replay del proveedor;
- configuración puede deshabilitar realtime y volver a polling.

## 7. Reconexión y recuperación

Al conectar/reconectar:

1. validar sesión/contexto;
2. realizar fetch autoritativo y guardar versión;
3. abrir transporte push si está habilitado;
4. si llega un hint durante bootstrap, repetir fetch si su versión es mayor;
5. aplicar backoff/jitter ante rechazo;
6. mostrar freshness/degradación si no converge.

Heartbeat/conexión abierta no prueba que el estado esté actualizado. El cliente ejecuta refresh periódico de seguridad incluso con push, con frecuencia mucho menor.

## 8. Estado UI

- `live`: dentro del freshness objetivo;
- `updating`: refetch en curso sin ocultar dato previo;
- `stale`: pasó umbral y puede no reflejar operación;
- `degraded`: transporte falló y opera fallback;
- `offline`: SPEC-218;
- `unauthorized`: contexto/sesión ya no permite la vista.

Kitchen/Floor muestran la última actualización y alertan staleness que afecte decisiones. Un toast por cada actualización queda prohibido; se actualiza la vista preservando foco y lectura.

## 9. Multi-tab y lifecycle

- Una pestaña oculta reduce/pausa polling.
- Requests anteriores se cancelan al cambiar tenant/branch/station.
- Tabs pueden coordinar un leader mediante APIs browser si se prueba seguro; cada tab igualmente valida contexto y versión.
- Cierre/suspensión del dispositivo no depende de callbacks para confirmar trabajo.
- Deploy/service worker conserva compatibilidad de mensajes o fuerza refetch.

## 10. Rendimiento y cuotas

- Payloads poseen presupuesto y compresión cuando corresponda.
- Endpoints usan índices y proyecciones, evitando N+1.
- `304`, cursor y delta reducen bytes, pero no sacrifican recuperación.
- Métricas calculan requests/conexiones/messages/bytes por usuario activo y escenario pico.
- Alertas de cuota siguen SPEC-208.
- El piloto no inicia si el escenario observado proyecta superar límites sin plan.

## 11. Observabilidad y SLO

Métricas:

- tiempo command accepted → estado visible;
- polling requests, 200/304, bytes y duración;
- conexiones, joins, reconnects y auth failures;
- hints received/duplicate/stale/gap;
- refetch success/failure y tiempo hasta convergencia;
- freshness/stale duration por app;
- fallback push → polling.

Objetivo inicial de demo: p95 menor a 5 segundos para OrderSubmitted visible en Kitchen y KitchenItemReady visible en Floor, medido end-to-end. El piloto ajusta el objetivo con observación real.

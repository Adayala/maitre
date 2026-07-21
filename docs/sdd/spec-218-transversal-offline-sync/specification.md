# Especificación — SPEC-218

## 1. Modelo de conectividad

La UI distingue:

- `ONLINE`: health funcional y sync al día;
- `DEGRADED`: red disponible, dependencia/latencia parcial;
- `OFFLINE`: no se puede alcanzar el servicio;
- `SYNCING`: existe intercambio activo;
- `CONFLICT`: una o más acciones requieren resolución;
- `AUTH_EXPIRED`: terminó la ventana offline autorizada.

`navigator.onLine` es sólo una señal. El estado efectivo combina health, requests recientes, timeout y sync. La transición se muestra sin bloquear acciones locales permitidas.

## 2. Matriz inicial de capacidades

| App | Offline permitido | Requiere ACK para confirmar | Online-only MVP |
| --- | --- | --- | --- |
| Guest | menú cacheado y carrito local | envío/aceptación del pedido | cuenta, pago, confirmación de pedido |
| Floor | consulta bootstrap, borrador/pedido y estados autorizados | aceptación final y conflictos | descuentos sensibles, cierre/pago/fiscal |
| Kitchen | comandas descargadas y transiciones permitidas | propagación a otras apps | cambios de configuración |
| Cash | última vista sólo lectura | toda mutación | caja, pagos, conciliación, factura/ARCA |
| Dash | última vista no autoritativa | toda mutación | administración y decisiones críticas |
| Connect | estado cacheado no autoritativo | toda mutación | OAuth, secretos, sync manual crítico |

Cada spec funcional refina esta matriz. La ausencia de una regla explícita significa online-only.

## 3. Bootstrap offline

Después de autenticarse online, una app habilitada descarga un snapshot mínimo:

- tenant, branch, user y alcance efectivo;
- expiración de la autorización offline;
- catálogo/menú necesario y versiones;
- mesas, estaciones o comandas activas según app;
- cursor de sincronización y hora del servidor;
- políticas de comandos offline vigentes.

El snapshot se aplica atómicamente. Si queda incompleto o no valida schema/hash, se conserva la versión anterior segura y se informa el fallo.

## 4. Identidad y autorización offline

- No se guardan passwords, service role ni secretos de servidor.
- Una sesión online válida emite/deriva un grant offline acotado a user, tenant, branch, device, capacidades y expiración.
- La ventana máxima inicial no supera un turno operativo y es configurable; requiere validación de producto/seguridad.
- El dispositivo debe poseer bloqueo local y no se comparte una sesión genérica entre empleados.
- Logout borra grants y datos sensibles; comandos pendientes exigen una transferencia/recuperación explícita antes de borrar.
- El servidor vuelve a autorizar cada comando al sincronizar y puede rechazar acciones si permisos cambiaron.

Un grant offline permite capturar intención, no obliga al servidor a aceptar un comando inválido al reconectar.

## 5. Almacenamiento local

IndexedDB implementa `LocalStorePort` con stores versionados para:

- bootstrap/reference data;
- proyecciones operativas mínimas;
- command journal;
- resultados, conflictos y sync cursor;
- metadata de schema, tenant, branch, user y expiración.

Reglas:

- partición lógica estricta por tenant + branch + user/device;
- no usar `localStorage` para payloads, cola o tokens;
- migraciones locales forward y recuperación ante versión incompatible;
- límites y presión de cuota visibles;
- limpieza por retención sólo para datos confirmados y no necesarios;
- datos sensibles minimizados; cifrado del browser no se presenta como defensa contra XSS o dispositivo comprometido.

## 6. Command journal

Cada intención local se persiste antes de actualizar la proyección optimista:

```json
{
  "clientMutationId": "uuid-v4",
  "commandName": "AddOrderItem",
  "commandVersion": 1,
  "tenantId": "tenant_...",
  "branchId": "branch_...",
  "aggregateId": "order_...",
  "baseVersion": 6,
  "createdAtLocal": "2026-07-21T18:30:00.000Z",
  "deviceId": "device_...",
  "payload": {},
  "status": "PENDING",
  "attempts": 0
}
```

- `clientMutationId` es también la idempotency key de la intención.
- IDs de entidades creadas offline son UUID aleatorios generados por el cliente o IDs temporales con mapping atómico; una spec elige una estrategia única por agregado.
- El reloj local no determina orden autoritativo.
- Estados: `PENDING`, `SENDING`, `ACKNOWLEDGED`, `REJECTED`, `CONFLICT` y `BLOCKED`.
- Reload/crash recupera `SENDING` vencido como reintentable.

## 7. Protocolo de sincronización

La sincronización ejecuta un ciclo acotado:

1. comprobar sesión/grant y conectividad funcional;
2. pull de cambios desde cursor del servidor;
3. aplicar cambios remotos y detectar conflictos locales;
4. push de comandos en batch con orden causal por agregado;
5. recibir resultado individual por `clientMutationId`;
6. actualizar proyección, mapping y cursor atómicamente;
7. repetir mientras haya trabajo, tiempo y presupuesto.

Un fallo parcial no confirma todo el batch. Cada resultado contiene status, versión autoritativa y Problem Details cuando corresponda. Batches tienen límites por cantidad/bytes y pueden reanudarse.

## 8. Orden e idempotencia

- Comandos de un mismo agregado conservan orden causal local.
- Agregados distintos pueden sincronizarse en paralelo de forma acotada.
- Servidor deduplica durablemente `tenant + commandName + clientMutationId`.
- Repetir un comando confirmado devuelve su resultado original.
- Un comando posterior queda `BLOCKED` si depende de otro rechazado/conflictivo.
- ACK del transporte no equivale a aceptación del dominio.

## 9. Conflictos

No existe una política universal:

- **append seguro:** agregar ítem nuevo puede rebasarse si invariantes siguen vigentes;
- **transición de estado:** servidor valida máquina de estados y versión actual;
- **edición del mismo dato:** requiere merge definido o elección humana;
- **eliminación/cierre remoto:** bloquea mutaciones dependientes y exige reconciliación;
- **precio, permiso, alérgeno o disponibilidad cambiados:** se presenta diferencia y no se acepta silenciosamente;
- **dinero/fiscalidad:** online-only en MVP, sin merge offline.

Last-write-wins sólo se permite para datos no críticos cuando la spec documenta por qué la pérdida es aceptable.

## 10. UX de confianza

- Indicador persistente muestra estado, última sincronización y cantidad pendiente.
- Cada acción distingue `guardada en dispositivo`, `enviando`, `confirmada`, `rechazada` o `requiere atención`.
- “Pedido enviado” se reserva para ACK del servidor; Guest nunca recibe confirmación falsa.
- Conflictos explican qué cambió, impacto y opciones permitidas.
- Retry manual no genera una nueva intención/idempotency key.
- Cerrar sesión, cambiar sucursal o limpiar datos advierte sobre comandos pendientes.
- Kitchen/Floor priorizan contraste, targets táctiles y recuperación sin modal repetitivo.

## 11. Service worker y actualización

- App shell y assets estáticos pueden cachearse con versiones/hash.
- Requests mutables no se cachean como responses exitosas ficticias.
- La activación de una versión nueva no interrumpe comandos pendientes.
- Una migración local se prueba antes de promover el service worker.
- Si versiones cliente/servidor son incompatibles, la app bloquea nuevas mutaciones, preserva journal y guía la actualización.
- Cache busting y rollback no eliminan IndexedDB sin plan de migración.

## 12. Seguridad y privacidad

- Content Security Policy, dependencias controladas y prevención XSS son controles primarios.
- Datos offline aplican minimización y retención por app.
- Cambio de user/tenant no expone snapshots previos.
- Un device perdido puede revocar futuras sincronizaciones; se documenta el riesgo de datos ya almacenados.
- Telemetría no incluye payloads del journal ni PII.
- Exportar/debuggear la cola requiere permiso y sanitización.

## 13. Observabilidad

Métricas mínimas:

- dispositivos/usuarios con sync pendiente;
- comandos pending, acknowledged, rejected, conflict y blocked;
- edad del comando pendiente más antiguo;
- duración/bytes de bootstrap, pull y push;
- retries, dedup hits, cursor reset y migración local fallida;
- tiempo offline y tiempo hasta convergencia.

Las alertas se orientan a backlog/edad y comandos críticos, no a cada desconexión individual.

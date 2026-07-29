# Aplicaciones y dispositivos

## Principio

Maitre es una suite de aplicaciones especializadas por rol y **modo de interacción**. Todas
convergen en una plataforma de datos y eventos compartidos. El eje principal no es sólo
`web/mobile`, sino **táctil vs no táctil**:

- **táctil** para operación del restaurante y experiencia del cliente;
- **no táctil** para administración, análisis y configuración profunda.

La experiencia del cliente y de la operación es **touch-first**; web con teclado/mouse actúa como
extensión de backoffice.

## Aplicaciones

| App | Dispositivo principal | Usuario | Contexto | Prioridad |
| --- | --- | --- | --- | --- |
| **Maitre Guest** | Táctil | Comensal | Reserva remota, menú QR, cuenta digital | MVP Fase 3 |
| **Maitre Floor** | Táctil | Mozo, maître, encargado | Toma de pedidos, movimientos en salón, asignaciones | MVP Fase 2 |
| **Maitre Kitchen** | Táctil | Cocina, barra, pasante | Recepción de comandas, producción, despacho | MVP Fase 2 |
| **Maitre Cash** | Táctil primero, no táctil opcional | Cajero | Caja, pagos, arqueo, cierre | MVP Fase 4 |
| **Maitre Dash** | No táctil primero | Dueño, gerente de operaciones | Dashboard, reportes, decisiones | MVP Fase 1 |
| **Maitre Connect** | No táctil | Admin técnico | Integraciones, conectores, webhooks | MVP Fase 5 |

## Matriz interacción × rol

```text
                    Táctil                     No táctil
Comensal            Guest                      —
Mozo                Floor                      —
Maître/Encargado    Floor                      Dash (secundario)
Cocina              Kitchen                    —
Barra               Kitchen                    —
Cajero              Cash                       Cash (secundario)
Dueño/Gerente       Dash (secundario)          Dash
Admin técnico       —                          Connect
```

### Dispositivos táctiles típicos

- teléfono;
- tablet;
- monitor táctil de caja;
- pantalla táctil de cocina;
- TV o monitor operativo con interacción touch, si el setup lo usa.

### Dispositivos no táctiles típicos

- notebook;
- desktop;
- monitor con teclado/mouse;
- estación administrativa de backoffice.

## Principios de diseño

### 1. Touch-first para operación

- **Guest:** táctil primario. Celular es el caso más frecuente.
- **Floor:** táctil primario. Tablet es preferida; celular como fallback.
- **Kitchen:** táctil primario. Tablet o monitor táctil optimizado para visibilidad y velocidad.
- **Cash:** táctil primario en operación de caja; no táctil permitido como extensión.
- **Computadora/no táctil:** extensión para análisis, administración y configuración, no operación
  real-time principal del salón.

### 2. Responsive por modo de interacción

- Una app por dominio puede rendir en varios tamaños.
- Layouts fluidos, no breakpoints discretos rígidos.
- En apps operativas, touch-first y mouse/teclado como secundarios.
- En Dash/Connect, teclado/mouse-first y touch como soporte.

### 3. Offline-capable

- **Guest:** Carga menú offline, sincroniza pedido cuando vuelve conectividad.
- **Floor:** Registra pedidos localmente, envía cuando hay conexión.
- **Kitchen:** Descarga comandas, marca estados localmente.
- **Cash:** Requiere conectividad para pagos (definir contingencia).

### 4. Contexto visual operacional

- **Guest:** Foto, ingredientes, alérgenos, precio. Carrito persistente.
- **Floor:** Plano del salón, estado de mesas, plaza asignada, pedidos en curso.
- **Kitchen:** Comandas por orden, tiempos, alertas de demora, estados.
- **Cash:** Resumen de cuenta, métodos de pago disponibles, cambio.

### 5. Acciones sin fricción

- **Guest:** Tomar pedido en 3 taps. Pedir cuenta en 1 tap.
- **Floor:** Asignar mesa en 2 taps. Cambiar estado de mesa en 1 tap.
- **Kitchen:** Marcar plato como listo en 1 tap.
- **Cash:** Procesar pago en 4 taps máximo.

### 6. Identidad visual por rol

Las aplicaciones comparten semántica de estados, foco, accesibilidad y contexto, pero no deben
parecer copias temáticas de un mismo dashboard. La forma visual refuerza el ambiente de uso:

- **Guest / Customer:** editorial cálida y gobernada por la presentación publicada de la marca.
- **Floor / Waiter:** brutalismo táctil, números grandes y contraste inmediato para operar mesas.
- **Host:** profundidad espacial y señales hospitalarias para llegadas, espera y asignación.
- **Kitchen:** superficie industrial de alta visibilidad para urgencia, tiempos y despacho.
- **Cashier:** jerarquía numérica y precisión de libro mayor para dinero, diferencias y cierre.
- **Dash:** composición editorial de control para lectura, configuración y decisión.

El branding multi-tenant aporta identidad, logos, fotografía y tipografía. No puede alterar colores
críticos, foco, contraste ni códigos operativos cuyo significado deba permanecer estable.

## Contratos técnicos mínimos

### Guest ↔ Backend

```text
GET /menus/:branchId
  → productos, precios, fotos, alérgenos, disponibilidad

POST /orders (offline-enabled)
  → itemId, quantity, modifiers, origin = CUSTOMER_QR

GET /visits/:visitId/bill
  → items, totales, métodos de pago

POST /payments
  → visitId, amount, method, receipt
```

### Floor ↔ Backend

```text
GET /branches/:branchId/serviceDay
  → salones, mesas, plaza assignments, visitas en curso

POST /visits
  → groupSize, tables, serviceJourney

PATCH /visits/:visitId
  → orderSubmitted, checkRequested, paymentReceived

GET /tables/:tableId/status
  → AVAILABLE, RESERVED, OCCUPIED, PAYING, CLEANING, BLOCKED
```

### Kitchen ↔ Backend

```text
GET /tickets (por estación)
  → ítems ordenados por tiempo, prioridad, visita

PATCH /tickets/:ticketId/item/:itemId
  → status = READY, DELIVERED, CANCELLED

GET /kitchen/alerts
  → demoras, pedidos sin comenzar, excepciones
```

### Dash ↔ Backend

```text
GET /analytics (por rama, date range, segmento)
  → visitas, cobertura, ingresos, tiempos, feedback

GET /operations
  → estado actual de sucursales, alertas, KPIs

GET /subscriptions
  → servicios activos, uso, próximo ciclo
```

## Experiencias por fase

### MVP Fase 1: Foundational Dash

- Crear tenant, marca, sucursal.
- Configurar salón (salones, mesas).
- Invitar usuarios, roles.
- Ver estado de suscripción.

### MVP Fase 2: Floor + Kitchen

- **Floor (mozo):** abrir visita, asignar mesas, tomar pedido.
- **Kitchen:** recibir comanda, cambiar estado, avisar cuando está lista.

### MVP Fase 3: Guest + Reservaciones

- **Guest:** reserva remota, confirmación, QR Menu autónomo.
- **Floor:** recibir reserva, marcar llegada, asignar mesa.

### MVP Fase 4: Cash

- **Cash:** registrar pagos, generar factura, cerrar caja.
- **Guest:** pago digital desde celular.

### MVP Fase 5: Integración + Reputación

- **Dash:** Google Business Profile, responder reseñas.
- **Connect:** webhooks, conectores.

## Datos críticos sincronizados entre apps

```text
Tenant
├── Branch
│   ├── Salon
│   │   ├── Table
│   │   └── CombinationTable
│   ├── ServiceDay
│   │   ├── Tour (plaza)
│   │   └── Shift
│   ├── Menu
│   │   └── Product (precio, foto, alérgenos)
│   └── Equipment (caja, impresora, dispositivos)
│
├── Visit
│   ├── Order
│   │   └── OrderItem (product, qty, modifiers)
│   ├── Kitchen Ticket
│   │   └── Item (status, timings)
│   ├── Bill
│   │   ├── Item
│   │   └── Payment
│   └── Feedback
│
└── User
    └── Assignment (role, branch, section)
```

## Comunicación entre apps (Event-driven)

```
Floor               Kitchen             Cash                Guest
  |                   |                  |                   |
  +-- OrderSubmitted -+                  |                   |
  |                   +-- TicketCreated -|                   |
  |                   +-- ItemReady ------>                  |
  |                                      +-- ItemDelivered --+
  +-- CheckRequested ----+               |                   |
  |                      +-- BillReady --+                   |
  |                                      +-- PaymentReceived +
  |                                                          |
  +--- FeedbackRequested <------ VisitClosed -------------- +
```

## Consideraciones offline

Las reglas normativas de captura local, sincronización, conflictos y seguridad están en
[`SPEC-218 — Offline Operation & Synchronization`](../spec-218-transversal-offline-sync/).

| App | Capacidad offline | Sincronización |
| --- | --- | --- |
| **Guest** | Menú descargado y carrito local | El pedido sólo se confirma al recibir ACK del servidor |
| **Floor** | Pedidos locales, cambios de estado | Batch al conectar, idempotencia por pedidoId |
| **Kitchen** | Descarga comandas, marca estados locales | Sync al conectar, reconciliación por ticketId |
| **Cash** | Última vista sólo lectura durante el MVP | Mutaciones de caja, pago y fiscalidad requieren conexión |
| **Dash** | Última sesión en caché | Siempre requiere conexión para decisiones |

## Acceso y seguridad

- **Guest:** acceso público o autenticado según flujo, siempre táctil por default.
- **Floor, Kitchen, Cash:** autenticación por usuario + branch scope; diseño táctil obligatorio para
  operación.
- **Dash:** autenticación + role-based access; no táctil primero.
- **Connect:** OAuth2 + API keys por conector; no táctil.

Todo cambio requiere tenant + sucursal en headers. Auditoría de usuario, hora y acción.

## Roadmap de apps

```
Phase 1: Dash (no táctil)
Phase 2: Floor (táctil), Kitchen (táctil)
Phase 3: Guest (táctil, mobile-first)
Phase 4: Cash (táctil primero, no táctil complementario)
Phase 5: Connect (no táctil)
Phase 6+: Apps nativas dedicadas si el volumen/dispositivo lo justifican
```

## Prioridad de optimización

1. **Guest.táctil:** Conversión de reserva/pedido remoto.
2. **Floor.táctil:** Velocidad de toma de pedido.
3. **Kitchen.táctil:** Visibilidad y rapidez.
4. **Dash.no táctil:** Completitud de reportes.
5. **Cash.táctil:** Integración con medios de pago.

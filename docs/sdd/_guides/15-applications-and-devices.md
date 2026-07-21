# Aplicaciones y dispositivos

## Principio

Maitre es una suite de aplicaciones especializadas por rol y dispositivo. Todas convergen en una plataforma de datos y eventos compartidos. **Mobile-first** en experiencia del cliente y operador; web como extensión.

## Aplicaciones

| App | Dispositivo principal | Usuario | Contexto | Prioridad |
| --- | --- | --- | --- | --- |
| **Maitre Guest** | Celular, tableta | Comensal | Reserva remota, menú QR, cuenta digital | MVP Fase 3 |
| **Maitre Floor** | Tablet, celular | Mozo, maître, encargado | Toma de pedidos, movimientos en salón, asignaciones | MVP Fase 2 |
| **Maitre Kitchen** | Tablet | Cocina, barra, pasante | Recepción de comandas, producción, despacho | MVP Fase 2 |
| **Maitre Cash** | Computadora, tablet | Cajero | Caja, pagos, arqueo, cierre | MVP Fase 4 |
| **Maitre Dash** | Computadora, tablet | Dueño, gerente de operaciones | Dashboard, reportes, decisiones | MVP Fase 1 |
| **Maitre Connect** | Computadora | Admin técnico | Integraciones, conectores, webhooks | MVP Fase 5 |

## Matriz dispositivo × rol

```text
                    Celular   Tablet    Computadora
Comensal            Guest ✓   Guest ✓   Dash (limitado)
Mozo                Floor ✓   Floor ✓   —
Maître/Encargado    Floor ✓   Floor ✓   Dash
Cocina              —         Kitchen ✓ —
Barra               —         Kitchen ✓ —
Cajero              —         Cash ✓    Cash ✓
Dueño/Gerente       Dash ✓    Dash ✓    Dash ✓
Admin               —         —         Connect ✓
```

## Principios de diseño

### 1. Mobile-first

- **Guest:** Celular es primario. Experiencia completa en 5.5"–6.5".
- **Floor:** Tablet es primario (7"–10"). Celular como fallback de emergencia.
- **Kitchen:** Tablet optimizada para visibilidad y velocidad. Sin distracciones.
- **Computadora:** Extensión para análisis y administración, no operación real-time.

### 2. Responsive, no adaptativo

- Una app para todos los tamaños.
- Layouts fluidos, no breakpoints discretos.
- Touch-first, mouse como secundario.

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

| App | Capacidad offline | Sincronización |
| --- | --- | --- |
| **Guest** | Menú (descargado), carrito local | Al conectar: sync pedido, recibir confirmación |
| **Floor** | Pedidos locales, cambios de estado | Batch al conectar, idempotencia por pedidoId |
| **Kitchen** | Descarga comandas, marca estados locales | Sync al conectar, reconciliación por ticketId |
| **Cash** | Transacciones locales (si política lo permite) | Sync pendiente, validar contra servidor |
| **Dash** | Última sesión en caché | Siempre requiere conexión para decisiones |

## Acceso y seguridad

- **Guest:** Sin autenticación (acceso por QR de mesa o link público).
- **Floor, Kitchen, Cash:** Autenticación por usuario + branch scope.
- **Dash:** Autenticación + role-based access.
- **Connect:** OAuth2 + API keys por conector.

Todo cambio requiere tenant + sucursal en headers. Auditoría de usuario, hora y acción.

## Roadmap de apps

```
Phase 1: Dash (web)
Phase 2: Floor (tablet), Kitchen (tablet)
Phase 3: Guest (celular/web)
Phase 4: Cash (web, tablet nativa si se justifica)
Phase 5: Connect (web)
Phase 6+: Apps nativas (iOS/Android) si volumen lo justifica
```

## Prioridad de optimización

1. **Guest.celular:** Conversión de pedido remoto.
2. **Floor.tablet:** Velocidad de toma de pedido.
3. **Kitchen.tablet:** Visibilidad y rapidez.
4. **Dash.web:** Completitud de reportes.
5. **Cash.web:** Integración con medios de pago.

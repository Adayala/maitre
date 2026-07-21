# Modelo de dominio

## Contextos principales

### Organización

```text
Tenant
Marca
EntidadFiscal
Sucursal
Salon
Mesa
CombinacionMesa
```

### Identidad

```text
Usuario
Empleado
Rol
Permiso
Membership
AsignacionSucursal
```

### Servicio de salón

```text
PlantillaServicio
JornadaServicio
Plaza
AsignacionPlaza
Visita
OcupacionMesa
```

### Reservas

```text
Reserva
RetencionDisponibilidad
GrupoCliente
ListaEspera
Seña
PoliticaCancelacion
```

### Pedidos y producción

```text
Menu
Producto
Precio
DisponibilidadProducto
Pedido
ItemPedido
Comanda
CentroPreparacion
Estacion
```

### Caja y fiscalidad

```text
Cuenta
Subcuenta
Pago
Caja
SesionCaja
MovimientoCaja
EntidadFiscal
PuntoVentaFiscal
ComprobanteFiscal
PeriodoIVA
```

### Experiencia

```text
Feedback
ExternalReview
ReputationCase
ResponseDraft
ExternalLocationMapping
```

### Plataforma comercial

```text
ServiceDefinition
ServiceVersion
ServiceDependency
PlanVersion
Subscription
SubscriptionItem
SubscriptionScope
Entitlement
Quota
UsageRecord
ProvisioningJob
```

## Relación operativa central

```mermaid
flowchart TD
    R[Reserva opcional] --> V[Visita]
    V --> O[Ocupaciones de mesas]
    V --> P[Pedidos]
    P --> C[Comandas]
    V --> U[Cuenta]
    U --> PA[Pagos]
    U --> F[Comprobantes]
    V --> FB[Feedback]
```

## Estados iniciales

### Reserva

```text
DRAFT → HELD → CONFIRMED → ARRIVED → SEATED → COMPLETED
                     └→ CANCELLED
                     └→ NO_SHOW
```

### Visita

```text
WAITING → SEATED → ORDERING → IN_SERVICE → CHECK_REQUESTED → PAYING → CLOSED
```

### Pedido

```text
DRAFT → SUBMITTED → ACCEPTED → IN_PREPARATION → READY → DELIVERED
```

El pedido puede estar parcialmente listo o cancelado con razones y autorización.

### Cuenta

```text
OPEN → PARTIALLY_PAID → PAID
```

### Mesa en una jornada

```text
AVAILABLE
RESERVED
OCCUPIED
PAYING
CLEANING
BLOCKED
```

El estado debe derivarse de reservas, ocupaciones y bloqueos; no ser una verdad aislada.

## Reglas invariantes

- Una mesa pertenece a un salón en un momento determinado.
- Una plaza pertenece a una jornada y agrupa mesas.
- Una visita puede ocupar varias mesas.
- Una reserva puede existir sin mesa asignada.
- Una ocupación tiene inicio y fin.
- Una mesa no puede tener ocupaciones incompatibles simultáneas.
- Una comanda deriva de uno o más ítems confirmados.
- Una cuenta puede recibir varios pagos.
- Un comprobante fiscal pertenece a una entidad fiscal y punto de venta.
- Desactivar servicios no altera históricos.
- Todo cambio sensible registra actor, origen, fecha y motivo.

## Eventos iniciales

```text
TenantCreated
ServiceActivated
BranchCreated
ServiceDayOpened
ReservationCreated
ReservationConfirmed
GuestArrived
VisitOpened
TableAssigned
OrderSubmitted
KitchenTicketCreated
DishPrepared
DishDelivered
CheckRequested
PaymentCompleted
FiscalDocumentAuthorized
VisitClosed
FeedbackReceived
ExternalReviewReceived
```

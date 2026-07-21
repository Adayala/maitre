# Tenancy, suscripciones y entitlements

## Jerarquía organizacional

```text
Tenant
├── Marcas
├── Entidades fiscales
├── Sucursales
├── Usuarios
├── Suscripciones
└── Integraciones
```

## Tenant

Es el comprador y límite principal de aislamiento de datos. Una persona puede pertenecer a varios tenants con roles diferentes.

## Marca

Identidad comercial que puede compartir catálogo, experiencia y políticas entre sucursales.

## Entidad fiscal

Persona humana o jurídica que emite comprobantes. Contiene CUIT, condición tributaria, certificados y puntos de venta.

## Sucursal

Unidad física y operacional. Puede heredar configuraciones de la marca y aplicar excepciones locales.

## Modelo de herencia

```text
Configuración global del tenant
→ configuración de marca
→ configuración de sucursal
→ configuración temporal de jornada
```

Cada nivel puede sobrescribir solamente propiedades autorizadas.

## Suscripción

La suscripción agrupa ítems contratados:

```text
Subscription
├── SubscriptionItem: Core
├── SubscriptionItem: 3 sucursales
├── SubscriptionItem: Floor para Palermo y Belgrano
├── SubscriptionItem: Reservations para Palermo
└── SubscriptionItem: ARCA para Entidad Fiscal A
```

## Alcances

Un ítem puede aplicar a:

- Tenant.
- Marca.
- Entidad fiscal.
- Sucursal.
- Punto de venta.
- Conector externo.

## Entitlements

Los servicios operativos consultan derechos efectivos, no planes comerciales.

```text
FLOOR.ACCESS = true
FLOOR.BRANCHES = [PALERMO, BELGRANO]
BRANCHES.MAX = 3
USERS.MAX = 25
ARCA.FISCAL_ENTITIES.MAX = 1
REPUTATION.CONNECTORS.GOOGLE = true
```

Los entitlements se aplican en API, interfaz, procesos asincrónicos e integraciones.

## Estados de suscripción

```text
DRAFT
TRIALING
ACTIVE
PAST_DUE
SUSPENDED
PENDING_CANCELLATION
CANCELLED
ARCHIVED
```

## Ciclo de cambio

```text
Selección
→ cotización
→ aceptación
→ pago
→ actualización de suscripción
→ generación de entitlements
→ provisioning
→ configuración pendiente
→ activación
```

## Altas

Las ampliaciones pueden ser inmediatas con prorrateo. El precio y los impuestos deben mostrarse antes de confirmar.

## Bajas

Las reducciones se aplican normalmente al final del ciclo. Si el nuevo límite es inferior al uso actual, el cliente debe seleccionar qué recursos desactivar.

## Conservación

La desactivación puede llevar recursos a:

```text
ACTIVE
READ_ONLY
SUSPENDED
ARCHIVED
```

Los comprobantes, pagos, auditoría y datos legalmente necesarios no se eliminan con la baja comercial.

## Medición de uso

Posibles métricas:

- Sucursales activas.
- Usuarios o dispositivos concurrentes.
- Puntos de venta fiscales.
- Cajas concurrentes.
- Reservas procesadas.
- Mensajes enviados.
- Reseñas sincronizadas.
- Pagos procesados.

Las mesas y plazas no serán inicialmente unidades principales de facturación.

## Autogestión

El dashboard debe permitir:

- Ver servicios y alcance.
- Agregar o retirar servicios.
- Comprar capacidad.
- Asignar servicios a sucursales.
- Revisar consumo.
- Visualizar próxima factura.
- Administrar prueba y renovación.
- Consultar tareas de configuración.
- Exportar datos antes de una baja.

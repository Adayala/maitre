# Spec: salones con capacidad declarada y sin mesas

## Decisión de dominio

En el I0, la capacidad declarada del salón es metadato operativo y límite de configuración; no es inventario reservable. La autoridad de disponibilidad es el conjunto de mesas de la sucursal y sus capacidades individuales.

Consecuencias:

- Availability devuelve `available: false` y `freeTableIds: []` si la sucursal no tiene mesas, aunque un salón declare capacidad positiva.
- Crear una reserva `PENDING` sigue permitido porque create no asigna capacidad.
- Confirmar devuelve `409` cuando no existe una mesa compatible.
- Seat requiere una reserva `CONFIRMED`; como no puede confirmarse sin mesa, devuelve `409` y no crea Visit ni Occupancy.

La regla es tenant/branch-scoped y no suma capacidades entre mesas ni introduce capacidad virtual global. Una futura policy configurable deberá versionarse explícitamente antes de cambiar esta autoridad.

## Pruebas

Un test API creará una sucursal aislada, un salón activo con capacidad declarada y cero mesas; verificará availability, create, confirm y seat, incluida la ausencia de Visit.

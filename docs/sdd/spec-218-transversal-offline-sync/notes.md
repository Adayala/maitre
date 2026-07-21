# Decisiones — SPEC-218

## Decisiones

- IndexedDB es el almacenamiento browser durable inicial; queda detrás de un port para permitir una app nativa o store distinto.
- `localStorage` no ofrece transacciones, capacidad ni estructura adecuadas.
- El servidor continúa siendo autoridad; offline captura intenciones y proyecciones.
- UUID aleatorio evita depender del reloj local. Cada agregado debe fijar si acepta ID final client-side o usa mapping temporal.
- El MVP prioriza continuidad de Floor/Kitchen, no autonomía fiscal o financiera.
- Service worker mejora disponibilidad del shell, pero no implementa por sí solo sincronización correcta.

## Decisiones pendientes para piloto

- Duración real del grant offline por rol/turno.
- Dispositivos compartidos versus asignados y política de bloqueo.
- Datos exactos del bootstrap por app y presupuesto de almacenamiento.
- Reglas de merge de Order y KitchenTicket.
- Navegadores/tablets mínimos y comportamiento de eviction.
- Necesidad futura de servidor local/edge en sucursales con mala conectividad prolongada.

## Triggers para arquitectura local

- cortes frecuentes mayores a la ventana autorizada;
- necesidad de coordinar dispositivos sin internet;
- caja/fiscalidad que deba continuar legalmente offline;
- volumen de datos incompatible con browser storage;
- requisitos de impresión o hardware local;
- convergencia cloud demasiado lenta para cocina/salón.

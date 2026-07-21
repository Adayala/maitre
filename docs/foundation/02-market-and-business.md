# Cliente, mercado y modelo de negocio

## Cliente inicial

Restaurante argentino con atención en mesas y estas características aproximadas:

- 15 a 80 mesas.
- Uno o varios salones.
- Turnos de almuerzo y cena.
- Mozos organizados por plazas.
- Cocina y barra separadas.
- Reservas y clientes espontáneos.
- Caja y facturación electrónica.
- Una o más sucursales actuales o planificadas.

## Compradores y usuarios

| Perfil | Necesidad principal |
| --- | --- |
| Dueño o socio | Rentabilidad, control y crecimiento |
| Gerente de operaciones | Comparar y coordinar sucursales |
| Encargado o maître | Conducir el servicio |
| Mozo | Atender mesas y registrar pedidos |
| Cocina/barra | Recibir, preparar y despachar comandas |
| Cajero | Cobrar, facturar y cerrar caja |
| Contador/administración | Conciliar comprobantes e IVA |
| Comensal | Reservar, pedir, pagar y ser atendido sin fricción |

## Estrategia de entrada

Maitre debe soportar dos modalidades:

1. **Sistema completo:** reemplaza progresivamente al POS y centraliza la operación.
2. **Capa complementaria:** ofrece reservas, QR, feedback, reputación o inteligencia conectándose con un sistema existente.

La segunda modalidad reduce la barrera de adopción; la primera maximiza integración y datos.

## Modelo de ingresos

- Cargo base por tenant.
- Cargo por sucursal activa.
- Servicios activados por sucursal o entidad fiscal.
- Capacidades adicionales: dispositivos, cajas concurrentes, puntos de venta o usuarios.
- Consumos externos: mensajes, pagos o conectores con costos variables.
- Servicios profesionales: implementación, migración y capacitación.
- Planes anuales con descuento.

No se recomienda cobrar como unidad principal por mesa o plaza porque su cantidad cambia con frecuencia y puede incentivar una configuración incompleta.

## Empaquetado

Los paquetes facilitan la compra, pero internamente se expresan como ítems de suscripción.

| Paquete tentativo | Contenido orientativo |
| --- | --- |
| Inicio | Core + una sucursal + QR Menu |
| Salón | Floor + Kitchen + Shifts |
| Restaurante | Salón + Cash + Billing |
| Fiscal | Billing + ARCA + IVA |
| Experiencia | Reservations + Feedback + Reputation |
| Cadena | Varias sucursales + reportes consolidados + integraciones |

## Métricas de negocio de Maitre

- Ingreso recurrente mensual y anual.
- Tenants y sucursales activas.
- Servicios activos por tenant.
- Expansión y contracción mensual.
- Churn por tenant y por sucursal.
- Tiempo hasta la primera operación.
- Uso semanal por rol.
- Costo de soporte por sucursal.
- Margen por servicio.

## Hipótesis a validar

- Los restaurantes pagarán por módulos por sucursal.
- Reservations, QR y Reputation pueden venderse sin reemplazar el POS.
- Una experiencia de onboarding asistido reduce significativamente el abandono.
- El valor de IA aparece después de integrar eventos de reservas, salón y cocina.
- Google Business Profile será el conector de reputación inicial más valioso en Argentina.

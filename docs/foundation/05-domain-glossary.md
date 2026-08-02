# Glosario del dominio

Este documento define el lenguaje ubicuo de Maitre.

| Término               | Definición                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Tenant                | Cliente que contrata Maitre y límite principal de aislamiento                                                               |
| Marca                 | Identidad comercial gastronómica                                                                                            |
| Entidad fiscal        | Persona que emite comprobantes y posee CUIT                                                                                 |
| Sucursal              | Local físico y unidad operativa                                                                                             |
| Salón                 | Área física que contiene mesas                                                                                              |
| Mesa                  | Recurso físico con capacidad y ubicación                                                                                    |
| Asiento               | Posición física opcional dentro de una mesa                                                                                 |
| Plaza                 | Grupo organizativo fijo o variable de mesas durante una jornada, asignable a un mozo sin actuar como límite de autorización |
| Plantilla de servicio | Configuración recurrente de desayuno, almuerzo o cena                                                                       |
| Jornada de servicio   | Ejecución concreta de una plantilla en una fecha                                                                            |
| Turno laboral         | Intervalo trabajado por un empleado                                                                                         |
| Sesión de caja        | Apertura, movimientos, arqueo y cierre de una caja                                                                          |
| Grupo o party         | Conjunto de personas que reserva o llega conjuntamente                                                                      |
| Reserva               | Compromiso futuro de capacidad                                                                                              |
| Retención             | Bloqueo temporal de disponibilidad mientras se confirma una reserva                                                         |
| Lista de espera       | Grupos pendientes de disponibilidad                                                                                         |
| Visita                | Servicio real prestado a un grupo desde su llegada hasta el cierre                                                          |
| Ocupación             | Relación temporal entre una visita y una o más mesas                                                                        |
| Cubierto              | Unidad estadística de comensal atendido                                                                                     |
| Comensal              | Participante de una visita, identificado o anónimo                                                                          |
| Pedido                | Solicitud comercial originada en salón, QR, mostrador u otro canal                                                          |
| Ítem de pedido        | Producto, cantidad, modificadores, observaciones y precio                                                                   |
| Comanda               | Instrucción de producción derivada de ítems de pedido                                                                       |
| Centro de preparación | Cocina, barra, parrilla, cafetería u otra área productiva                                                                   |
| Estación              | Subdivisión operacional de un centro de preparación                                                                         |
| Precuenta             | Presentación no fiscal de consumos y total provisional                                                                      |
| Cuenta                | Obligación comercial acumulada y susceptible de división                                                                    |
| Subcuenta             | Parte asignada de una cuenta                                                                                                |
| Pago                  | Cancelación total o parcial de una cuenta                                                                                   |
| Comprobante           | Documento comercial o fiscal                                                                                                |
| Punto de venta fiscal | Numeración registrada para emitir comprobantes por un canal                                                                 |
| Feedback              | Opinión obtenida directamente por el restaurante                                                                            |
| Reseña externa        | Opinión publicada en una plataforma de terceros                                                                             |
| Servicio comercial    | Capacidad que Maitre ofrece y factura                                                                                       |
| Suscripción           | Acuerdo vigente de contratación                                                                                             |
| Entitlement           | Derecho efectivo de uso derivado de la suscripción                                                                          |
| Capacidad o quota     | Límite cuantitativo de un entitlement                                                                                       |
| Configuración         | Forma en que el cliente utiliza una capacidad contratada                                                                    |
| Conector              | Adaptador a un sistema externo                                                                                              |
| Evento de dominio     | Hecho relevante e inmutable comunicado por un dominio                                                                       |

## Distinciones obligatorias

- Reserva no es visita.
- Mesa no es plaza.
- Plaza no es permiso ni alcance RBAC.
- Jornada no es turno laboral.
- Pedido no es comanda.
- Cuenta no es pago.
- Pago no es comprobante fiscal.
- Tenant no es entidad fiscal.
- Marca no es sucursal.
- Servicio comercial no es microservicio técnico.

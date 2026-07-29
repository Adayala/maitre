# Especificación — SPEC-231

| App/superficie | Servicio requerido | Cantidad visible |
| --- | --- | --- |
| Host / reservas | `RESERVATIONS` | N/A |
| Waiter / salón y pedidos | `FLOOR` | `WAITERS` |
| Kitchen / KDS | `KITCHEN` | N/A |
| Cashier / caja | `CASH` | `CASHIERS` |
| Customer / carta | `QR_MENU` | N/A |
| Customer / pedido desde mesa | `QR_ORDERING` | N/A |

Las apps consultan SPEC-230 después de resolver tenant y sucursal. Mientras carga no muestran la
superficie. Si falta el servicio, muestran nombre del módulo requerido y una indicación para
contactar al administrador.

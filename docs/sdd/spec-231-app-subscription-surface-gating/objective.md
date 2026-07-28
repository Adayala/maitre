# Objetivo — SPEC-231

Mostrar a cada usuario solamente módulos habilitados por su suscripción y las cantidades efectivas
del alcance seleccionado, sin confundir falta de contratación con falta de permisos.

## Criterios de aceptación

- [ ] Host requiere `RESERVATIONS`.
- [ ] Waiter requiere `FLOOR` y muestra cantidad `WAITERS`.
- [ ] Kitchen requiere `KITCHEN`.
- [ ] Cashier requiere `CASH` y muestra cantidad `CASHIERS`.
- [ ] Customer muestra menú con `QR_MENU` y pedidos sólo con `QR_ORDERING`.
- [ ] Una app sin servicio muestra estado explicativo y no renderiza el módulo operativo.

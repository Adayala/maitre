# Spec: preservar el huésped elegido al crear reservas desde Host

## Contexto

GitHub #115 demuestra que Host crea o encuentra correctamente un huésped con los datos del formulario, pero `POST /v1/branches/:branchId/reservations` sustituye ese `guestId` por el huésped derivado del usuario autenticado. El resultado muestra `Demo Owner` en lugar del cliente ingresado.

## Decisión

El endpoint interno de reservas respetará el `guestId` enviado por clientes staff como Host. Antes de crear la reserva comprobará que el huésped existe dentro del tenant activo; un identificador inexistente o perteneciente a otro tenant responderá `404` sin revelar existencia externa. La creación sin `guestId` seguirá admitida por el contrato vigente.

La vinculación automática desde identidad se mantiene exclusivamente en `/v1/my/reservations`, que es la superficie customer-scoped y ya posee esa responsabilidad.

## Límites de tenant y autorización

- La búsqueda usa `container.guests.findById(ctx.tenantId, guestId)`.
- No se acepta ni consulta un huésped fuera del tenant activo.
- Se mantienen `reservation:create` y los permisos PII actuales de las rutas de huéspedes.
- No se incorporan nombres, usuarios, tenants o marcas hardcodeados.

## Unidades, branches y errores a probar

- Reserva staff con huésped válido: conserva exactamente su `guestId`.
- Reserva staff sin huésped: mantiene el comportamiento opcional vigente.
- `guestId` inexistente: `404 Guest`.
- `guestId` de otro tenant: mismo `404 Guest`, sin filtración cross-tenant.
- Host crea/encuentra el huésped usando nombre, email y teléfono y envía su ID.
- El checklist reacciona al valor actual del nombre y la tarjeta representa al huésped persistido.

## Playwright

Suite dueña: `tests/e2e/apps/host/`.

Fixture determinista: tenant activo con una sucursal, usuario staff y un huésped distinto del usuario de sesión. El recorrido completa nombre, email, teléfono, comensales, horario, duración y notas; guarda; y verifica checklist completo, tarjeta con el nombre del huésped y ausencia del nombre del usuario autenticado. También cubre loading, error, responsive, permisos y accesibilidad según el contrato Host existente.

## Criterios de aceptación

- `guest-data`: la reserva conserva el huésped ingresado y nunca lo reemplaza por la identidad staff.
- `checklist`: el nombre válido completa “Huésped identificado” y el estado persiste en el resultado visible.
- `tenant-safety`: huésped inexistente y cross-tenant producen la misma respuesta segura.
- `tests`: código modificado con 100% statements, branches, functions y lines, más Playwright Host.

## Fuera de alcance

- Cambiar el modelo de capacidad o confirmación (#106, #112).
- Rediseñar mensajes y paneles de error (#113, #114).
- Fusionar perfiles duplicados de huéspedes.

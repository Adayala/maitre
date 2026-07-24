# Objetivo — SPEC-223

Propagar cambios operativos con latencia suficiente para el servicio gastronómico, manteniendo consistencia, autorización, recuperación y portabilidad dentro del presupuesto inicial.

## Resultados esperados

- Kitchen ve pedidos nuevos y Floor ve ítems listos sin refresh manual.
- Un mensaje perdido no produce divergencia permanente.
- Clientes reconectados recuperan gaps desde estado autoritativo.
- Tenant, sucursal, role y station limitan cada stream/update.
- Frecuencia, conexiones y volumen se miden contra free tier.
- El transporte puede migrar sin cambiar casos de uso o modelos de UI.

## Fuera de alcance

- Garantizar exactly-once por WebSocket.
- Usar presencia como fuente de verdad de usuarios/turnos.
- Exponer Postgres Changes directamente como contrato de producto.
- Reemplazar outbox, APIs o sincronización offline.

## Criterios de aceptación

### CAD-223-01 — La distribución realtime propaga hints operativos con latencia útil sin convertirse en autoridad

Realtime distribuye cambios con suficiente rapidez para la operación, pero los hints nunca sustituyen el estado autoritativo ni los comandos síncronos/asíncronos principales.

### CAD-223-02 — La consistencia se recupera por refetch, replay o fallback cuando se pierden mensajes

Hints perdidos, duplicados, stale o gaps no producen divergencia permanente. La recuperación debe converger desde una fuente autoritativa observable.

### CAD-223-03 — Tenant, branch, role y station acotan streams y topics con seguridad verificable

Cada canal o stream aplica aislamiento por contexto y permiso efectivo. Un cliente reconectado o revocado no puede seguir viendo datos fuera de su alcance.

### CAD-223-04 — La UX hace visible desactualización, reconexión y fallback sin fabricar confirmaciones falsas

La app distingue claramente estados live, stale, offline y recovered. Un hint no confirma un comando rechazado ni roba foco con ruido innecesario.

### CAD-223-05 — El volumen, conexiones y costo se miden dentro del presupuesto del MVP

La estrategia realtime debe poder operar dentro del free tier o degradar a polling/fallback aprobados. El presupuesto y las cuotas no se asumen infinitos.

### CAD-223-06 — La implementación conserva portabilidad a otro transporte sin reescribir casos de uso o modelos de UI

El transporte inicial puede cambiar o deshabilitarse por configuración. La UI y los casos de uso siguen consumiendo una abstracción estable, no detalles del proveedor realtime.

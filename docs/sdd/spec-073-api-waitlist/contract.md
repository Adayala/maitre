# Contrato API — SPEC-073 Waitlist

Rutas por Branch para add/list/get y commands notify/seat/cancel/expire/priority-override. Add
no es idempotente todavía. La lista usa el orden autoritativo simplificado del I0
(`priorityOverride`, `arrivedAt`, `id`) y no cursor. Notify no reserva mesa; seat abre y vincula
Visit, pero aún sin atomicidad explícita con la capa Floor. `priority-override` requiere permiso
dedicado separado de `waitlist:manage`. Datos opcionales como `notes` hoy no se redactan.
Tests cubren concurrencia de seating, orden, expiry, duplicate notification, scope y audit.

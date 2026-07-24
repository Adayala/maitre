# Especificación — SPEC-109

Permisos: `kitchen.queue.read`, `kitchen.command.claim`, `start`, `hold`, `ready`, `handoff`,
`cancel`, `transfer`, `reprioritize`; `kitchen.station.manage`; `kitchen.alert.acknowledge`,
`resolve`, `escalate`.

COOK recibe operaciones de producción según alcance de station; MAITRE/MANAGER administra routing y
excepciones. Expediter es assignment de permisos, no rol local. Si Workforce/turno no está
disponible se deniegan comandos con ownership obligatorio; lectura degradada puede continuar.
Overrides exigen motivo y auditoría; revocación invalida autorización.

Permissions canónicas I0:

```text
kitchen.queue.read
kitchen.command.claim
kitchen.command.start
kitchen.command.hold
kitchen.command.ready
kitchen.command.handoff
kitchen.command.cancel
kitchen.command.transfer
kitchen.command.reprioritize
kitchen.station.manage
kitchen.alert.acknowledge
kitchen.alert.resolve
kitchen.alert.escalate
```

COOK opera comandos y colas dentro de sus stations asignadas. MAITRE y MANAGER administran
configuración, routing y excepciones; MANAGER conserva la autoridad de override cuando la policy lo
exige. Expediter no es rol local: es una combinación de assignments/permisos sobre handoff y lectura
operativa. Si falta shift activo, ownership requerido o station assignment, la operación mutativa se
deniega aunque el actor tenga el permiso nominal.

La lectura degradada de colas o alertas puede permitirse bajo policy cuando la información no
otorga capacidad de mutar. Esa degradación nunca habilita `claim`, `start`, `ready`, `handoff`,
`transfer` o `reprioritize`. Nadie puede autoasignarse permisos o sortear la revocación activa.

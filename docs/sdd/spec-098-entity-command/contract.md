# Contrato — SPEC-098 Command

Command es una TicketLine autoritativa de KitchenTicket con payload discriminado, priority y
status `RECEIVED | CLAIMED | IN_PROGRESS | ON_HOLD | READY | COMPLETED | CANCELLED`. READY termina
producción y COMPLETED confirma handoff; errores técnicos son attempts reintentables, no estado
`FAILED`. Transiciones requieren versión/actor y no cruzan branch/station. Tests cubren duplicados,
concurrencia, retry, cancel race y producción parcial.

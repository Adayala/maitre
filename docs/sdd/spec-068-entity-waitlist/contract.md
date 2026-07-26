# Contrato — SPEC-068 Waitlist

WaitlistEntry representa un grupo esperando en Branch con `partySize`, `guestId` opcional,
`quotedMinutes` opcional, `priorityOverride`, status `WAITING | NOTIFIED | SEATED | CANCELLED |
EXPIRED`, revisión y timestamps. El orden combina prioridad explícita, `arrivedAt` e `id`; nunca
debe mutar `arrivedAt` al repriorizar. Notificación no reserva capacidad. Seating enlaza una
Visit existente desde la capa de rutas. Tests cubren lifecycle básico, terminalidad, orden estable
y override manual.

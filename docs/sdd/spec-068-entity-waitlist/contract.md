# Contrato — SPEC-068 Waitlist

WaitlistEntry representa un grupo esperando en Branch: party size, guest/contact mínimo,
quotedAt/estimate, priority reason, status `WAITING | NOTIFIED | SEATED | CANCELLED | EXPIRED`,
version y auditoría. Orden combina arrival sequence y prioridad explícita; nunca se altera
silenciosamente. Notificación no reserva capacidad. Seating enlaza una Visit y es idempotente.
Tests cubren orden estable, concurrencia, expiración, contacto/consent y cross-tenant.

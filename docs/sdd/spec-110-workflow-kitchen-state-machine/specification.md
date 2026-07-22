# Especificación — SPEC-110 Kitchen State Machine

## Transiciones válidas

- `RECEIVED -> CLAIMED | CANCELLED`
- `CLAIMED -> IN_PROGRESS | RECEIVED | CANCELLED`
- `IN_PROGRESS -> ON_HOLD | READY | CANCELLED`
- `ON_HOLD -> IN_PROGRESS | CANCELLED`
- `READY -> COMPLETED`; rollback excepcional `READY -> IN_PROGRESS` exige manager + motivo
- `COMPLETED` y `CANCELLED` son terminales

Claim fija owner; release a RECEIVED sólo antes de producir. READY certifica producción terminada;
COMPLETED certifica handoff. Cancel después de IN_PROGRESS genera waste/adjustment y nunca borra
historia. Cada transición valida expected revision, idempotencia, actor, station y precondiciones;
persiste historial + outbox atómicamente.

Errores técnicos se registran como attempts y no agregan `FAILED` al lifecycle. Transfer conserva
estado elegible e identidad, cambia station con evento/audit y nunca deja ownership dual.

# Especificación — SPEC-114 BreakLog

BreakLog pertenece a una `TimeEntry` y conserva `breakType`, `paidClassification`,
`laborPolicyVersion`, `openedAt`, `closedAt?`, `timezone`, `source`, `deviceId` y
`deviceSequence`.

Lifecycle implementado: `OPEN -> CLOSED`.

Reglas implementadas:

- la `TimeEntry` debe existir y estar `OPEN` para iniciar una pausa;
- `openedAt` no puede ser anterior al inicio efectivo de la jornada;
- no puede existir más de una pausa `OPEN` para la misma `TimeEntry`;
- `closedAt` no puede ser anterior a `openedAt`;
- `endBreak` exige `expectedRevision` y falla por conflicto si la revisión cambió;
- `clock-out` con pausa abierta se rechaza o autocierra según `laborPolicyVersion`.

Cuando una pausa se autocierra por clock-out, se persiste `findingReasonCode`. Las correcciones usan
`BreakAdjustment` append-only y actualizan `effectiveOpenedAt`/`effectiveClosedAt` sin mutar los
timestamps fuente.

No está implementado en I0 un validador general que asegure que toda pausa cerrada quede dentro del
fin efectivo de la jornada, ni un workflow de findings más rico que `findingReasonCode`.

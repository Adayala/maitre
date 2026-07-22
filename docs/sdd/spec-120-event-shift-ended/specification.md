# Especificación — SPEC-120 WorkShiftCompleted

Nombre normativo `workforce.work-shift.completed.v1`. Se emite al command administrativo que
cambia WorkShift a COMPLETED, no por clock-out individual.

Envelope SPEC-217 + workShift ID, branch, completedAt, outcome, policy/revision y flags agregados.
Entradas abiertas impiden completar salvo override auditado; el evento nunca contiene fichadas,
Employment IDs o importes. Conteos pequeños se suprimen según privacy threshold.

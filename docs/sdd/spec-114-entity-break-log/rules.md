# Reglas — SPEC-114

- BreakLog pertenece a una sola TimeEntry.
- No admite dos pausas OPEN simultáneas.
- Type, paid classification y policy version se congelan al abrir.
- BreakAdjustment es append-only y no edita timestamps fuente.
- Clock-out con pausa abierta sigue la policy version vigente congelada.

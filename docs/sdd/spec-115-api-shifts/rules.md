# Rules — SPEC-115

- Create y commands usan idempotencia; edits/transiciones validan revisión esperada.
- Intervalos se modelan con UTC + timezone IANA explícita.
- `publish` revalida cobertura, conflictos y assignments/elegibilidad.
- `complete` no cierra ni ajusta TimeEntry/BreakLog implícitamente.
- Detail fuera de scope usa `404`; collections filtran antes de paginar.
- `cancel` sólo aplica a `DRAFT`/`PUBLISHED`; `COMPLETED` y `CANCELLED` son terminales.
- Conflictos o transiciones inválidas responden explícitamente; no se degradan a warning silencioso.

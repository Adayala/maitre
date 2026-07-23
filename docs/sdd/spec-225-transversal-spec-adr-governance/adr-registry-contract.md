# Contrato del registro ADR — SPEC-225

## 1. Fuente de verdad

Cada `docs/adr/ADR-NNN-slug.md` es la fuente autoritativa de su decisión. El registro de
`docs/adr/README.md` es una proyección humana: debe coincidir con archivos existentes, pero
no puede cambiar el estado de una decisión por sí mismo.

## 2. Metadata mínima

| Campo | Regla |
| --- | --- |
| `ID` | `ADR-NNN`, único e igual al nombre del archivo |
| `Estado` | `PROPOSED`, `ACCEPTED`, `DEPRECATED` o `SUPERSEDED` |
| `Fecha` | fecha ISO de creación/decisión |
| `Deciders` | rol/lista estable o `UNASSIGNED` mientras está propuesto |
| `Specs relacionadas` | IDs existentes o artefactos explícitos como `TECH_STACK` |
| `Blockers` | obligatorio para una propuesta bloqueada |
| `Accepted revision` | commit/revisión verificable para `ACCEPTED` |
| `Reemplazado por` | ADR existente para `SUPERSEDED` |

Campos de lifecycle que no aplican se omiten; no se completan con valores ficticios.

## 3. Reglas de estado

- `PROPOSED` no autoriza implementación y puede usar `Deciders: UNASSIGNED` si lo declara como blocker.
- `ACCEPTED` exige deciders distintos de `UNASSIGNED`, revisión aceptada y criterios P0 satisfechos.
- `DEPRECATED` exige alternativa y condición/fecha de retiro.
- `SUPERSEDED` exige sucesor existente y relación recíproca cuando el sucesor lo reemplaza explícitamente.
- Un cambio material de decisión crea un nuevo ADR o vuelve la propuesta a review; no reescribe historia aceptada silenciosamente.

## 4. Checks del validador

`ADR001` reporta:

- ID/filename inválido o duplicado;
- estado fuera del enum;
- metadata obligatoria ausente;
- `ACCEPTED` sin deciders/revisión;
- `PROPOSED` con deciders sin asignar pero sin blocker;
- transición incompatible con metadata de lifecycle.

`ADR002` reporta:

- spec relacionada inexistente;
- successor inexistente o ciclo inválido;
- link local roto;
- divergencia de ID/estado/archivo en `docs/adr/README.md`.

La resolución de un link externo se ejecuta fuera del gate determinista de pull request.

La estructura de autoría, checklist, change classes y transiciones detalladas se rigen por
`adr-authoring-readiness-contract.md`.

## 5. Checkpoint actual

ADR-001–004 cumplen identidad, estado canónico y relaciones locales existentes. El índice
coincide con sus estados y archivos. ADR-001 conserva `ACCEPTED` con decider por rol y la
revisión `0e85355`; ADR-002–004 permanecen `PROPOSED`, con deciders `UNASSIGNED` y blockers
de aceptación explícitos.

Este checkpoint es documental. No sustituye fixtures ni la futura ejecución de
`npm run sdd:validate`.

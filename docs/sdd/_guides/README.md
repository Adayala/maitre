# Guías SDD de Maitre

Mapa de lectura para trabajar con especificaciones. Las guías explican el proceso; no
reemplazan contratos normativos ni autorizan implementación.

## Empieza aquí

1. [Inicio SDD](../START_HERE.md): contexto, navegación y secuencia I0.
2. [Estructura de una spec](SPEC_STRUCTURE.md): directorios, metadata y archivos.
3. [Gobernanza SPEC-225](../spec-225-transversal-spec-adr-governance/): lifecycle,
   ownership, aprobación, registro y ADRs.
4. [Review I0](../I0_READINESS_REVIEW.md): blockers antes del scaffolding.
5. [SPEC-226](../spec-226-transversal-i0-platform-validation-spikes/): evidencia para
   decidir plataforma y toolchain.

## Documentos de orientación

| Documento | Uso | Autoridad |
| --- | --- | --- |
| [Roadmap histórico](00-mvp-specifications-roadmap.md) | descubrir capacidades/fases originales | planificación histórica |
| [Prioridades históricas](01-priority-specs-todo.md) | entender el orden propuesto originalmente | planificación histórica |
| [Apps y dispositivos](15-applications-and-devices.md) | contexto de superficies y operación | guía de producto |
| [APIs](16-api-specifications.md) | contexto de contratos HTTP | guía; SPEC-215 es normativa |
| [Eventos](17-event-specifications.md) | contexto de eventos y consumidores | guía; SPEC-217 es normativa |
| [Índice](../INDEX.md) | explorar alcance histórico | no autoritativo |

Los conteos y checkboxes históricos no representan `Estado`, `Readiness`, aprobación ni
implementación. La metadata autoritativa vive en el README de cada `spec-NNN-*`.

## Flujo spec-driven

```text
necesidad / foundation / ADR
  → spec PLANNED o DRAFT
  → contrato + criterios + blockers explícitos
  → IN_REVIEW con owner/reviewer
  → READY_FOR_IMPLEMENTATION aprobado
  → issue/task trazable
  → código + tests + evidencia
  → VERIFIED
```

Completar documentos o checkboxes no promueve una spec. Un cambio de estado es una decisión
versionada que debe cumplir las reglas de SPEC-225.

## Fuente correcta según la pregunta

| Pregunta | Documento |
| --- | --- |
| ¿Por qué existe Maitre y qué principios aplica? | `docs/foundations/` |
| ¿Qué comportamiento debe cumplir una feature? | spec funcional `SPEC-NNN` |
| ¿Qué regla cruza varias features? | spec transversal `SPEC-NNN` |
| ¿Por qué se eligió una arquitectura? | `docs/adr/ADR-NNN-*` |
| ¿Qué se implementa primero? | SPEC-222 y readiness I0 |
| ¿Cómo se implementará? | `plan.md` y `tasks.md` de una spec aprobada |
| ¿Cómo se demuestra? | `verification.md`, tests y evidencia enlazada |
| ¿Cómo se opera/recupera? | runbook asociado al comportamiento implementado |

Si dos fuentes se contradicen, no se aplica precedencia silenciosa: se detiene el cambio
afectado y se resuelve según SPEC-225.

## Identidad y metadata

- Directorio: `spec-NNN-type-name/`.
- ID único, inmutable y coincidente con el directorio.
- `Tipo` base separado de `Subtype`.
- `Estado` separado de `Readiness` y `Blockers`.
- Owner/reviewer desconocidos se registran `UNASSIGNED`.
- Dependencias se enlazan por ID, no mediante slugs históricos.

Consulta el [contrato del registro](../spec-225-transversal-spec-adr-governance/registry-contract.md)
para enums y campos completos.

## Clases de cambio

- Editorial: formato, ortografía o links sin alterar comportamiento.
- Compatible: precisión o capacidad adicional tolerada por consumidores actuales.
- Incompatible: cambia significado, schema, API, evento, permiso o garantía.

Un cambio incompatible vuelve a review, analiza consumidores/migración y crea o supersede
un ADR cuando modifica una decisión arquitectónica.

## Calidad y verificación

Toda spec debe permitir comprobar:

- problema, alcance y no objetivos;
- reglas, edge cases y errores;
- seguridad, tenancy, privacidad, offline y costo cuando aplican;
- dependencias y consumidores;
- criterios de aceptación observables;
- evidencia requerida para `VERIFIED`.

El contrato mecánico está en
[`validation-contract.md`](../spec-225-transversal-spec-adr-governance/validation-contract.md).
`npm run sdd:validate` será obligatorio cuando se implemente; nunca sustituirá review
semántico.

## Crear o modificar

1. Comprueba que no exista una spec/ADR equivalente.
2. Reserva ID y crea el paquete mínimo según [SPEC_STRUCTURE](SPEC_STRUCTURE.md).
3. Registra sólo hechos conocidos; no inventes owners, prioridad o aceptación.
4. Actualiza dependencias, ADRs y consumidores afectados en el mismo cambio.
5. Ejecuta validaciones disponibles y solicita review proporcional al riesgo.
6. Implementa comportamiento nuevo sólo desde una revisión `READY_FOR_IMPLEMENTATION`.

## Referencias normativas

- [SPEC-207 — Quality gates](../spec-207-transversal-engineering-quality/)
- [SPEC-215 — HTTP API standards](../spec-215-transversal-http-api-standards/)
- [SPEC-217 — Events](../spec-217-transversal-events-async-processing/)
- [SPEC-221 — CI/CD](../spec-221-transversal-ci-cd-release-management/)
- [SPEC-224 — Testing](../spec-224-transversal-testing-test-data/)
- [SPEC-225 — Governance](../spec-225-transversal-spec-adr-governance/)

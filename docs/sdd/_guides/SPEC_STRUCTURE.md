# Estructura de directorios para specs

Guía práctica para organizar una spec de Maitre. La gobernanza normativa de IDs,
metadata, estados, aprobación, ADRs, registro y deprecación pertenece a
[`SPEC-225`](../spec-225-transversal-spec-adr-governance/).

## Convención de nombre

```text
docs/sdd/spec-NNN-type-name/
```

- `NNN`: ID decimal único, inmutable y no reutilizable.
- `type`: tipo base en kebab-case (`entity`, `api`, `event`, `rbac`, `calculation`,
  `app` o `transversal`).
- `name`: slug descriptivo, estable y en kebab-case.

Ejemplos vigentes:

- [`spec-001-entity-tenant/`](../spec-001-entity-tenant/)
- [`spec-023-api-auth/`](../spec-023-api-auth/)
- [`spec-225-transversal-spec-adr-governance/`](../spec-225-transversal-spec-adr-governance/)

El ID del directorio, el título y la fila `ID` del README deben coincidir.

## Paquete mínimo

```text
spec-NNN-type-name/
├── README.md
├── objective.md
├── specification.md
├── rules.md
├── plan.md
├── tasks.md
├── verification.md
└── notes.md
```

Responsabilidades:

| Archivo | Contenido |
| --- | --- |
| `README.md` | metadata autoritativa, resumen, alcance y navegación |
| `objective.md` | problema, resultados, no objetivos y aceptación |
| `specification.md` | contrato normativo observable |
| `rules.md` | invariantes, prohibiciones y excepciones |
| `plan.md` | estrategia y secuencia derivada del contrato |
| `tasks.md` | trabajo trazable, no evidencia de implementación por sí solo |
| `verification.md` | checks automáticos/manuales y evidencia requerida |
| `notes.md` | decisiones menores, fuentes, riesgos y preguntas abiertas |

Un documento especializado se agrega cuando mejora precisión. Ejemplos:

- entidad: `structure.md`, `lifecycle.md`, `relationships.md`;
- API: `openapi.yaml`, `errors.md`, `authorization.md`;
- evento: `schema.md`, `consumers.md`, `delivery.md`;
- cálculo: `formula.md`, `inputs.md`, `edge-cases.md`;
- app: `user-journey.md`, `states.md`, `offline-behavior.md`;
- transversal: contratos de calidad, seguridad, plataforma u operación.

No se crean archivos vacíos sólo para completar una plantilla.

## README autoritativo

Ejemplo mínimo para una spec nueva:

```markdown
# [SPEC-NNN] Título

Descripción breve del contrato.

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-NNN |
| **Tipo** | Entity |
| **Subtype** | Aggregate |
| **Dominio** | Organization |
| **Estado** | DRAFT |
| **Readiness** | NOT_ASSESSED |
| **Prioridad** | UNASSIGNED |
| **Owner** | UNASSIGNED |
| **Reviewer** | UNASSIGNED |
| **Blockers** | Revisar contrato y asignar prioridad/ownership |
| **Depende de** | N/A |

## Documentos

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Reglas](rules.md)
- [Plan](plan.md)
- [Tareas](tasks.md)
- [Verificación](verification.md)
- [Notas](notes.md)
```

`Subtype` es opcional. `Blockers` es obligatorio cuando readiness es `BLOCKED` o hay
decisiones pendientes que impiden review/implementación. Campos condicionales y enums
completos están en el
[`contrato del registro`](../spec-225-transversal-spec-adr-governance/registry-contract.md).

## Tipos base

| Prefijo | `Tipo` | Uso |
| --- | --- | --- |
| `entity` | `Entity` | modelo/agregado de dominio |
| `api` | `API` | contrato HTTP o conector expuesto como API |
| `event` | `Event` | hecho publicado y su delivery |
| `rbac` | `RBAC` | permisos y scopes de un dominio |
| `calculation` | `Calculation` | fórmula/algoritmo de negocio |
| `app` | `App` | flujo o contrato de experiencia |
| `transversal` | `Transversal` | requisito que cruza features/dominios |

Especializaciones como `Connector`, `Architecture Decision`, `Technical Spike` o
`Security boundary` se expresan en `Subtype`, no dentro de `Tipo`.

## Estados y readiness

`Estado` usa exclusivamente:

```text
PLANNED | DRAFT | IN_REVIEW | READY_FOR_IMPLEMENTATION |
IN_PROGRESS | VERIFIED | DEPRECATED | SUPERSEDED
```

Readiness es una dimensión separada:

```text
NOT_ASSESSED | PROPOSED_FOR_REVIEW | READY_FOR_I0_REVIEW | BLOCKED
```

No se concatenan comentarios al estado. Un owner/reviewer sin asignar, una pregunta P0 o
una dependencia pendiente se registra como blocker. Sólo `READY_FOR_IMPLEMENTATION`, con
aprobaciones completas, autoriza comportamiento nuevo.

## Cómo crear una spec

1. Confirma que la necesidad no esté cubierta por otra spec o ADR.
2. Reserva un ID sin colisión según SPEC-225; no renumeres IDs existentes.
3. Crea el directorio canónico y el paquete mínimo.
4. Completa metadata con valores conocidos; usa `UNASSIGNED` en lugar de inventar personas.
5. Define problema, no objetivos, reglas, edge cases y aceptación observable.
6. Enlaza dependencias por ID y actualiza consumidores afectados.
7. Ejecuta `npm run sdd:validate` cuando el tooling esté disponible; mientras tanto revisa
   manualmente identidad, links y archivos.
8. Somete la spec a review; no promociones el estado mediante checkboxes o por completar documentos.

## Cómo modificar una spec

- Editorial: corrige formato/links sin cambiar comportamiento.
- Compatible: actualiza criterios, tests y consumidores afectados.
- Incompatible: vuelve a review, define migración/deprecación y crea ADR si cambia una
  decisión arquitectónica significativa.

Código, tests y documentación se actualizan atómicamente cuando la spec ya está
implementada. Una spec verificada se conserva como historia y se supersede; no se elimina
para limpiar el repositorio.

## Índices

El README de cada spec es la fuente autoritativa. [`INDEX.md`](../INDEX.md) es actualmente
un roadmap histórico y será reemplazado por una proyección generada. No se usan sus
checkboxes para representar lifecycle.

## Referencias

- [Inicio SDD](../START_HERE.md)
- [Gobernanza SPEC-225](../spec-225-transversal-spec-adr-governance/)
- [Contrato del registro](../spec-225-transversal-spec-adr-governance/registry-contract.md)
- [Contrato del validador](../spec-225-transversal-spec-adr-governance/validation-contract.md)
- [Registro ADR](../../adr/README.md)

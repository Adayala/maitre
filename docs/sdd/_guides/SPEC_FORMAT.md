# Spec Format — Spec-Driven Development

> El lifecycle, las aprobaciones, el versionado de cambios y la gobernanza normativa están definidos en [`SPEC-225`](../spec-225-transversal-spec-adr-governance/).

Formato completo para cada especificación de Maitre, basado en metodología AI-native de Microsoft.

## Estructura completa

Cada spec es **autocontendida** y tiene este formato:

```
spec-[type]-[name]/
├── README.md               (metadata, overview, quick links)
├── objective.md            (propósito, resultado esperado, criterios de aceptación)
├── specification.md        (definición formal, esquemas, reglas)
├── plan.md                 (cómo se implementa, arquitectura, dependencias)
├── tasks.md                (pasos concretos a ejecutar)
├── verification.md         (cómo se verifica, tests, criterios)
└── notes.md                (asunciones, riesgos, decisiones, referencias)
```

---

## Archivo 1: README.md

Metadata y overview rápido.

```markdown
# [SPEC-NNN] Título de la spec

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-NNN |
| **Título** | Nombre descriptivo |
| **Tipo** | Entity, API, Event, StateMachine, RBAC, Calculation, Connector, App, Transversal |
| **Dominio** | Organization, Identity, Subscription, Floor, Kitchen, Ordering, etc |
| **Status** | PLANNED, DRAFT, IN_REVIEW, READY_FOR_IMPLEMENTATION, IN_PROGRESS, VERIFIED, DEPRECATED, SUPERSEDED |
| **Prioridad** | P0 (crítica), P1 (alta), P2 (media), P3 (baja) |
| **Fase** | 1, 2, 3, 4, 5, 6 |
| **Owner** | @nombre |
| **Estimación** | Xs, XXh, XXd (story points) |
| **Created** | YYYY-MM-DD |
| **Last updated** | YYYY-MM-DD |

## Overview

[Párrafo breve: qué es, por qué importa]

## Related Specs

- [SPEC-XXX] [Título relacionado]
- [SPEC-YYY] [Título relacionado]

## Quick Links

- [Objetivo](objective.md)
- [Especificación](specification.md)
- [Plan](plan.md)
- [Tasks](tasks.md)
- [Verificación](verification.md)
- [Notas](notes.md)

## Estado actual

[Última actualización]
```

---

## Archivo 2: objective.md

Propósito y criterios de aceptación.

```markdown
# Objetivo — SPEC-NNN

## Propósito

[1-2 párrafos: qué problema resuelve, qué oportunidad habilita]

## Resultado esperado

Al completar esta spec:

[Resultado 1]
[Resultado 2]
[Resultado 3]

## Criterios de aceptación

- [ ] **CAD-1:** [Criterio específico y verificable]
  - Cómo se verifica: ...
  - Paso a paso: ...

- [ ] **CAD-2:** [Criterio específico y verificable]
  - Cómo se verifica: ...

- [ ] **CAD-3:** ...

## User stories

```
Como [rol]
Quiero [acción]
Para que [resultado]
```

## Success metrics

[Si aplica: cómo se mide el éxito]
```

---

## Archivo 3: specification.md

Definición formal, esquemas, reglas.

```markdown
# Especificación — SPEC-NNN

## Tipo de spec

[Entity, API, Event, StateMachine, RBAC, Calculation, Connector, App, Transversal]

## Definición formal

[Descripción técnica precisa]

### Schema / Structure

[JSON schema, UML, o definición estructurada]

```json
{
  "field1": "type",
  "field2": "type"
}
```

### Enums / Constants

[Valores posibles, constantes]

## Reglas e invariantes

- **Regla 1:** [Descripción]
- **Regla 2:** [Descripción]
- **Invariante 1:** [Condición que siempre debe ser verdadera]

## Validaciones

[Qué se valida, cómo, en qué momento]

## Ejemplos

### Ejemplo 1: [Caso de uso]

```json
[Ejemplo JSON]
```

### Ejemplo 2: [Caso de uso]

```json
[Ejemplo JSON]
```

## Edge cases

[Casos especiales, límites, excepciones]
```

---

## Archivo 4: plan.md

Cómo se implementa: arquitectura, componentes, dependencias.

```markdown
# Plan de implementación — SPEC-NNN

## Estrategia general

[Descripción de alto nivel del enfoque]

## Componentes a crear/modificar

| Componente | Descripción | Nuevo/Existente |
| --- | --- | --- |
| ComponentA | Descripción | Nuevo |
| ComponentB | Descripción | Existente |

## Arquitectura

[Diagrama o descripción de cómo interactúan los componentes]

## Dependencias

- **Specs que deben estar DONE antes:**
  - SPEC-XXX
  - SPEC-YYY

- **Specs que dependen de ésta:**
  - SPEC-AAA
  - SPEC-BBB

- **Dependencias externas:**
  - Librería X versión Y
  - Servicio Z

## Data flow

[Cómo fluyen los datos, diagrama si es complejo]

## Consideraciones técnicas

- [Consideración 1]
- [Consideración 2]
- [Performance, scalability, security, etc]

## Alternativas consideradas

[Qué otras opciones había, por qué se eligió ésta]
```

---

## Archivo 5: tasks.md

Pasos concretos, checklist ejecutable.

```markdown
# Tasks — SPEC-NNN

## Fase 1: Preparación

- [ ] **TASK-1:** [Descripción específica]
  - Subtask 1.1: [Paso concreto]
  - Subtask 1.2: [Paso concreto]
  - Entrega: [Qué se entrega]
  - Tiempo estimado: Xs

- [ ] **TASK-2:** [Descripción específica]
  - Subtask 2.1: ...
  - Entrega: ...
  - Tiempo estimado: ...

## Fase 2: Implementación

- [ ] **TASK-3:** [Crear componente X]
  - Subtask 3.1: Definir schema
  - Subtask 3.2: Crear archivo Y
  - Subtask 3.3: Agregar validaciones
  - Entrega: Código en branch feature/spec-nnn
  - Tiempo estimado: XXh

- [ ] **TASK-4:** [Crear endpoint Z]
  - Subtask 4.1: POST /resource
  - Subtask 4.2: GET /resource/:id
  - Subtask 4.3: PATCH /resource/:id
  - Entrega: API funcionando, documentada
  - Tiempo estimado: XXh

## Fase 3: Testing

- [ ] **TASK-5:** [Tests unitarios]
  - Subtask 5.1: Test casos base
  - Subtask 5.2: Test edge cases
  - Subtask 5.3: Test errores
  - Entrega: Coverage > 80%
  - Tiempo estimado: Xs

- [ ] **TASK-6:** [Tests de integración]
  - Subtask 6.1: ...
  - Entrega: ...

## Fase 4: Review y Merge

- [ ] **TASK-7:** [Code review]
  - Subtask 7.1: Peer review
  - Subtask 7.2: Fix feedback
  - Entrega: PR aprobado
  - Tiempo estimado: Xs

- [ ] **TASK-8:** [Merge]
  - Subtask 8.1: Merge a main
  - Subtask 8.2: Deploy a staging
  - Entrega: Deployed
  - Tiempo estimado: Xs

## Estimación total

[Sumar todos los tiempos]

## Dependencias entre tasks

[Qué task debe terminar antes de que otra empiece]

```

---

## Archivo 6: verification.md

Cómo se verifica que la spec está completa y correcta.

```markdown
# Verificación — SPEC-NNN

## Criterios de terminación

- [ ] **CT-1:** [Código merged a main]
- [ ] **CT-2:** [Tests pasando (cobertura > 80%)]
- [ ] **CT-3:** [Deployed a staging/production]
- [ ] **CT-4:** [Documentación actualizada]
- [ ] **CT-5:** [Code review aprobado]

## Test plan

### Unit tests

```
Test: [Descripción]
Given: [Estado inicial]
When: [Acción]
Then: [Resultado esperado]
```

[Repetir para cada caso de prueba]

### Integration tests

[Flujos completos que involucran múltiples componentes]

### E2E tests (si aplica)

[Tests desde la perspectiva del usuario]

## Validación de criterios de aceptación

| CAD | Test | Resultado | Notas |
| --- | --- | --- | --- |
| CAD-1 | test_xxx | ✅ | Pasó |
| CAD-2 | test_yyy | ✅ | Pasó |

## Performance checks (si aplica)

- Latencia: < XXms
- Throughput: > XX req/s
- Memory: < XXMb

## Security checks

- [x] No secretos en logs
- [x] Autorización validada
- [x] Inputs sanitizados
- [x] HTTPS/TLS validado

## Regresión testing

[Verificar que cambios no rompieron nada]

## Sign-off

**Verificado por:** @nombre
**Fecha:** YYYY-MM-DD
**Estado:** PASSED ✅ / FAILED ❌
```

---

## Archivo 7: notes.md

Asunciones, riesgos, decisiones, referencias.

```markdown
# Notas — SPEC-NNN

## Asunciones

- [Asunción 1: descripción, por qué, impacto si es falsa]
- [Asunción 2]

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| [Riesgo 1] | Alta/Media/Baja | Alto/Medio/Bajo | [Acción] |
| [Riesgo 2] | ... | ... | ... |

## Decisiones de diseño

### Decisión 1: [Título]

**Contexto:** [Por qué hay que decidir algo]

**Alternativas consideradas:**
1. [Opción A: pro y contra]
2. [Opción B: pro y contra]
3. [Opción C: pro y contra]

**Decisión:** [Opción X porque ...]

**Consecuencias:** [Qué implica esta decisión]

---

### Decisión 2: ...

## Cambios posteriores

[Si la spec se modificó después de ser escrita, documentar cambios]

## Referencias

- [Link a documento externo]
- [Link a spec relacionada]
- [RFC, papers, documentación]

## Conversaciones

[Links a issues, PRs, discussiones donde se debatió esto]

## Autor y revisores

| Rol | Nombre | Firma | Fecha |
| --- | --- | --- | --- |
| Autor | @nombre | ✅ | YYYY-MM-DD |
| Revisor 1 | @nombre | ✅ | YYYY-MM-DD |
| Revisor 2 | @nombre | ⏳ | — |

## Historial de cambios

| Versión | Cambio | Autor | Fecha |
| --- | --- | --- | --- |
| v1.0 | Creación | @nombre | YYYY-MM-DD |
| v1.1 | Agregado task X | @nombre | YYYY-MM-DD |
```

---

## Template para copiar

```bash
# Crear spec nueva
mkdir -p /docs/sdd/spec-[type]-[name]

# Copiar template
cp template/README.md /docs/sdd/spec-[type]-[name]/
cp template/objective.md /docs/sdd/spec-[type]-[name]/
cp template/specification.md /docs/sdd/spec-[type]-[name]/
cp template/plan.md /docs/sdd/spec-[type]-[name]/
cp template/tasks.md /docs/sdd/spec-[type]-[name]/
cp template/verification.md /docs/sdd/spec-[type]-[name]/
cp template/notes.md /docs/sdd/spec-[type]-[name]/

# Editar con ID y contenido
```

---

## Numbering

Specs numeradas secuencialmente:

```
SPEC-001: spec-entity-tenant
SPEC-002: spec-entity-brand
SPEC-003: spec-entity-fiscal-entity
...
SPEC-193: [última spec del MVP]
```

Fácil referencia sin cambiar nombres de directorios.

---

## Checklist de completitud

Antes de marcar una spec como READY_FOR_IMPLEMENTATION:

- [ ] README.md: metadata completa, status actualizado
- [ ] objective.md: criterios de aceptación claros
- [ ] specification.md: esquema completo, reglas, ejemplos
- [ ] plan.md: componentes, dependencias, arquitectura
- [ ] tasks.md: pasos concretos, estimaciones
- [ ] verification.md: criterios de terminación, tests
- [ ] notes.md: asunciones, riesgos, decisiones
- [ ] Specs relacionadas: linkeadas en README
- [ ] Dependencias: claras en plan.md
- [ ] Ejemplos: JSON válido, realista
- [ ] Revisado por: al menos 1 peer

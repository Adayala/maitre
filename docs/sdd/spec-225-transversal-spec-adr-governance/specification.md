# Especificación — SPEC-225

## 1. Fuentes y responsabilidades

| Artefacto | Responsabilidad |
| --- | --- |
| Foundations | visión, principios, dominio y límites de producto |
| Spec funcional | comportamiento, datos, APIs, eventos, reglas y aceptación |
| Spec transversal | requisitos de arquitectura/calidad aplicables a múltiples features |
| ADR | decisión, contexto, alternativas, trade-offs y consecuencias |
| Plan/tasks | secuencia implementable derivada de specs aprobadas |
| Código/tests | implementación y evidencia; no redefinen silenciosamente el contrato |
| Runbook | operación y recuperación del comportamiento implementado |

Una guía explica cómo trabajar; una spec normativa define qué debe cumplirse. Si una guía contradice una spec vigente, se corrige la guía.

## 2. Identidad

- Formato: `SPEC-NNN` con número decimal único.
- El ID se asigna al crear el primer draft y no cambia al renombrar título/directorio.
- Un ID retirado no se reutiliza.
- `INDEX.md`/registro mantiene ID, slug, título, tipo, dominio, estado y reemplazo.
- Duplicados o referencias ambiguas bloquean validación.
- Specs históricas sin ID normalizado se migran mediante cambio explícito; no reciben un número que colisione.

## 3. Estados

```text
PLANNED
  → DRAFT
  → IN_REVIEW
  → READY_FOR_IMPLEMENTATION
  → IN_PROGRESS
  → VERIFIED
  → DEPRECATED → SUPERSEDED
```

| Estado | Significado |
| --- | --- |
| `PLANNED` | necesidad registrada; contrato insuficiente |
| `DRAFT` | propuesta editable; no autoriza implementación |
| `IN_REVIEW` | contrato completo bajo revisión |
| `READY_FOR_IMPLEMENTATION` | comportamiento aprobado y sin blockers |
| `IN_PROGRESS` | implementación activa contra la revisión aprobada |
| `VERIFIED` | aceptación y gates poseen evidencia sobre implementación |
| `DEPRECATED` | continúa soportada temporalmente, no se usa para trabajo nuevo |
| `SUPERSEDED` | reemplazada; conserva historia y apunta a sucesora |

`DONE` es alias legado de `VERIFIED` durante migración y no se usa en specs nuevas. Un documento puede volver de revisión/implementación a `DRAFT` si cambia su premisa.

## 4. Metadata mínima

El README declara:

- ID, título, slug, tipo y dominio;
- estado y prioridad;
- owner responsable;
- reviewers/aprobadores requeridos;
- fecha de creación/última actualización;
- versión/revisión aprobada o commit;
- dependencias y specs relacionadas;
- reemplaza/es reemplazada por cuando aplica;
- feature/incremento de SPEC-222.

No se inventa un owner nominal si todavía no existe; se registra rol/`UNASSIGNED`, que bloquea readiness cuando el ownership es obligatorio.

## 5. Paquete mínimo por tipo

Toda spec nueva contiene:

- `README.md`: metadata, alcance y navegación;
- `objective.md`: problema, resultados, no objetivos y aceptación;
- `specification.md`: contrato normativo;
- `rules.md`: invariantes/prohibiciones/excepciones;
- `plan.md`: estrategia y etapas;
- `tasks.md`: trabajo trazable;
- `verification.md`: evidencia automática/manual;
- `notes.md`: decisiones, fuentes, riesgos y preguntas.

Archivos especializados —schema, lifecycle, API, event, RBAC, sync— se agregan sólo si mejoran precisión. No se crean documentos vacíos para satisfacer una plantilla.

## 6. Readiness review

Una spec entra a `IN_REVIEW` cuando:

- problema, alcance y no-objetivos son claros;
- términos coinciden con glosario/modelo;
- reglas y edge cases críticos están definidos;
- seguridad, tenancy, privacidad, offline y costo fueron evaluados;
- APIs/eventos/versiones se enlazan cuando corresponda;
- dependencias no están ambiguas;
- criterios son observables y tests posibles;
- preguntas abiertas P0 están resueltas o bloquean explícitamente.

Para `READY_FOR_IMPLEMENTATION` se requiere aprobación proporcional:

| Cambio | Aprobación mínima |
| --- | --- |
| Producto/UX | product/domain owner |
| API/event/schema | domain + consumidor/engineering |
| Arquitectura transversal | architecture/engineering owner |
| Seguridad/privacidad | security owner o revisión designada |
| Fiscal/pagos/legal | domain + especialista competente |
| Editorial | autor/reviewer según branch policy |

En un equipo de una persona, los roles pueden coincidir, pero la evidencia y checklist permanecen separadas.

## 7. Clases de cambio

### Editorial

Ortografía, links, formato o aclaración sin cambiar comportamiento. No reabre aprobación funcional; sí pasa validación documental.

### Compatible

Agrega caso/campo opcional o precisión que consumidores existentes toleran. Requiere review de afectados, tests y actualización de revisión.

### Incompatible

Cambia/remueve significado, regla, campo, estado, permiso, error, timing, garantía o criterio. Requiere:

- volver a `IN_REVIEW`;
- análisis de consumidores/datos/migración;
- estrategia de coexistencia/deprecación;
- actualización atómica de specs dependientes;
- ADR cuando modifica decisión arquitectónica significativa;
- nueva versión pública de API/evento cuando aplique.

## 8. ADRs

Formato recomendado:

```text
docs/adr/ADR-NNN-short-title.md
```

Metadata: status (`PROPOSED`, `ACCEPTED`, `DEPRECATED`, `SUPERSEDED`), date, deciders, related specs y successor.

Contenido:

- contexto/problema;
- fuerzas/restricciones;
- opciones consideradas;
- decisión y razones;
- consecuencias positivas/negativas;
- triggers de revisión/migración;
- evidencia/fuentes.

Una ADR no duplica toda la spec. La spec enlaza la ADR aceptada; la ADR enlaza contratos afectados. Cambiar una decisión conserva el ADR anterior como superseded.

## 9. Conflictos

No se aplica una precedencia silenciosa. Ante contradicción:

1. detener implementación/merge del comportamiento afectado;
2. identificar artefactos y revisiones vigentes;
3. verificar principio fundacional, contrato específico y ADR aceptada;
4. decidir con owners apropiados;
5. actualizar todos los artefactos afectados en el mismo cambio o enlazar migración;
6. añadir validación que evite recurrencia.

Mientras se resuelve, el comportamiento desplegado estable no se cambia por interpretación unilateral.

## 10. Trazabilidad

```text
Foundation / ADR
  → SPEC-NNN criteria/rules
  → plan task / issue
  → commit / pull request
  → test / report
  → deployment / release evidence
```

PRs declaran specs y criterios implementados. Tests nombran/enlazan criterios cuando el mapping no es evidente. Un release lista revisiones/commits de specs incluidas.

## 11. Verificación automática

`sdd:validate` verifica como mínimo:

- IDs y slugs únicos;
- metadata/estado válidos;
- archivos mínimos no vacíos;
- links internos y related specs existentes;
- dependencias y sucesores válidos;
- ausencia de ciclos inválidos;
- estados coherentes con tareas/evidencia;
- catálogo/INDEX/START_HERE sincronizados;
- URLs normativas opcionalmente en job programado;
- reglas Markdown/whitespace.

No marca una spec como correcta semánticamente; reduce inconsistencia mecánica.

## 12. Deprecación y archivo

- `DEPRECATED` indica fecha, consumidores, alternativa y retiro.
- `SUPERSEDED` enlaza la spec/ADR sucesora y conserva historia.
- No se elimina una spec implementada para “limpiar” el repo.
- Ejemplos peligrosos/obsoletos se marcan claramente o se corrigen.
- Código se retira sólo después de cerrar consumidores, datos y soporte.
- Índices muestran vigente versus histórico sin confundir prioridades.

## 13. Excepciones y urgencias

Un incidente puede requerir fix inmediato basado en regresión y contrato existente. Si el comportamiento esperado no estaba definido:

- crear una enmienda mínima o decisión de emergencia;
- documentar riesgo y owner;
- no usar la urgencia para introducir feature no relacionada;
- completar review/spec/ADR después según SPEC-221;
- conservar test que formaliza la corrección.

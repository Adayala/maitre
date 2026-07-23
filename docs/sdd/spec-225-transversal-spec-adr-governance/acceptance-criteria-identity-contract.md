# Contrato de identidad de criterios de aceptación — SPEC-225

## Propósito

Cada criterio verificable necesita una identidad estable para relacionar spec, test, gate, finding y
evidencia sin depender de texto mutable o posición en una lista.

## Formato

```text
SPEC-NNN-AC-MMM
```

- `NNN` coincide con la spec propietaria.
- `AC` significa acceptance criterion.
- `MMM` es secuencial de tres dígitos, único dentro de la spec.
- Un ID emitido no se reutiliza aunque el criterio sea retirado.

Ejemplo:

```markdown
- [ ] **SPEC-010-AC-001** — Crear Branch deriva `tenantId` del contexto autenticado.
```

El checkbox representa evidencia actual, no identidad ni aprobación.

## Propiedad y referencias

El criterio vive en `verification.md` de su spec propietaria. Otros documentos pueden referenciarlo,
pero no redefinirlo. Un criterio transversal pertenece a la spec transversal correspondiente y las
specs consumidoras enlazan ese ID.

Cada criterio declara las reglas `SPEC-NNN-RULE-MMM` que demuestra, según
`rule-identity-traceability-contract.md`.

Un test puede cubrir varios criterios y un criterio puede requerir varios tests/gates. La relación es
many-to-many explícita mediante `evidenceRefs`.

## Granularidad

Un criterio debe expresar un resultado observable con outcome binario o enum definido. Se separa
cuando:

- distintos gates pueden producir outcomes independientes;
- éxito y seguridad/aislamiento requieren evidencia diferente;
- una parte puede ser `NOT_APPLICABLE` sin invalidar las demás;
- el criterio mezcla más de un actor, boundary o transición no atómica.

No se crean IDs para títulos, tareas de implementación, ejemplos ni afirmaciones no verificables.

## Lifecycle

| Estado | Uso |
| --- | --- |
| `ACTIVE` | criterio vigente |
| `SUPERSEDED` | reemplazado por uno o más IDs explícitos |
| `RETIRED` | ya no aplica por cambio de alcance aprobado |

Editar redacción conserva ID sólo si no cambia outcome, boundary ni evidencia requerida. Un cambio
semántico crea otro ID y marca el anterior `SUPERSEDED`.

El registro de retiro incluye razón, decision ref, successor opcional y commit efectivo.

## Outcomes de evidencia

Para una ejecución concreta:

```text
PASS | FAIL | NOT_RUN | NOT_APPLICABLE | INCONCLUSIVE
```

- `PASS` enlaza evidencia reproducible.
- `FAIL` abre/referencia finding.
- `NOT_RUN` nunca se interpreta como éxito.
- `NOT_APPLICABLE` requiere razón revisada para ese contexto.
- `INCONCLUSIVE` conserva incertidumbre y bloquea cuando el criterio es requerido.

El texto `[x]` sin artifact, commit y reviewer no basta para `PASS` durable.

## Migración

El checkout contiene 226 `verification.md` y ninguno usa todavía IDs propios `SPEC-NNN-AC-MMM`.
La migración se realiza por bloque:

1. inventariar cada bullet/escenario existente;
2. descartar tareas o slogans que no sean criterios;
3. dividir criterios compuestos;
4. asignar IDs en orden documental estable;
5. conservar checkboxes sin marcarlos;
6. mapear tests/evidencia existente o registrar gap;
7. revisar el diff semántico y publicar el mapping.

No se asignan IDs mediante búsqueda/reemplazo global: primero se determina granularidad y propiedad.

## Mapping de migración

Cada lote conserva:

```yaml
source:
  file: <verification.md>
  heading: <sección>
  textHash: <hash del texto original>
target:
  criteria: [SPEC-NNN-AC-MMM]
classification: CRITERION | SPLIT | DUPLICATE | TASK | NON_VERIFIABLE
reviewedBy: <asignación o UNASSIGNED>
effectiveFrom: <commit/ref>
```

Esto permite explicar splits, deduplicación y exclusiones sin inventar historia.

## Validaciones

- ID propio coincide con directorio.
- Unicidad global y por spec.
- Secuencia no necesita ser contigua, pero nunca reutiliza IDs.
- Toda referencia apunta a criterio existente y `ACTIVE`, salvo historia explícita.
- `SUPERSEDED` identifica successors.
- `PASS` posee evidence ref y commit.
- Un criterio requerido sin outcome válido bloquea `VERIFIED`.

## Criterios de salida

- [ ] Los 226 `verification.md` poseen criterios con IDs estables.
- [ ] Cero criterios compuestos o no verificables sin clasificar.
- [ ] Tests y gates referencian IDs, no texto libre.
- [ ] Retiros/supersessions conservan historia.

Los checks permanecen abiertos.

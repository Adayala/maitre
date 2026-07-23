# Contrato de identidad y trazabilidad de reglas — SPEC-225

## Propósito

Las reglas e invariantes necesitan identidad estable para relacionar dominio, criterio de aceptación,
tarea, test, evento y finding. Un título o posición de lista no es una referencia durable.

Cada regla enlaza el outcome `SPEC-NNN-OBJ-MMM` que operacionaliza, según
`objective-outcome-contract.md`.

## Identidad canónica

```text
SPEC-NNN-RULE-MMM
```

- `NNN` coincide con la spec propietaria.
- `MMM` es secuencial de tres dígitos, único y no reutilizable.
- La definición autoritativa vive en `rules.md`.
- Otras specs pueden consumirla por referencia, pero no redefinirla.

Ejemplo:

```markdown
- **SPEC-004-RULE-002:** `tenantId` de Branch es inmutable.
```

## Qué recibe ID

Reciben ID:

- invariantes de estado o pertenencia;
- pre/postcondiciones normativas;
- prohibiciones y límites;
- reglas de cálculo, autorización o transición;
- garantías observables de API/evento.

No reciben ID:

- ejemplos;
- tareas;
- decisiones pendientes;
- referencias a ADRs, spikes u otras specs;
- recomendaciones no normativas.

## Aliases legacy

SPEC-001, SPEC-004 y SPEC-023 poseen 43 IDs legacy (`TEN-001`–`TEN-014`,
`BRA-001`–`BRA-015`, `AUTH-001`–`AUTH-014`). No se eliminan ni reasignan.

La migración crea mapping:

```yaml
canonical: SPEC-004-RULE-002
aliases: [BRA-002]
status: ACTIVE
effectiveFrom: <commit/ref>
```

Referencias nuevas usan el ID canónico. Las legacy continúan resolviendo mientras exista alias y se
pueden retirar sólo después de cero consumidores.

`ADR-NNN` y `SPK-NN` nunca son aliases de reglas: son tipos de identidad distintos.

## Granularidad

Una regla expresa una obligación indivisible. Se divide cuando combina:

- más de una transición independiente;
- autorización y efecto de negocio con evidencias distintas;
- invariantes que pueden cambiar por separado;
- una regla normativa y una recomendación.

Una regla puede requerir varios criterios. Cada criterio declara `ruleRefs`; una regla sin criterio
debe justificar por qué sólo es revisable estáticamente.

## Lifecycle

| Estado | Semántica |
| --- | --- |
| `ACTIVE` | regla vigente |
| `DEPRECATED` | vigente durante migración, con successor/fecha |
| `SUPERSEDED` | reemplazada por uno o más IDs |
| `RETIRED` | ya no aplica por decisión aprobada |

Cambiar outcome, boundary o actor crea otro ID. Correcciones editoriales conservan ID.

## Trazabilidad mínima

```yaml
id: SPEC-NNN-RULE-MMM
aliases: []
status: ACTIVE
source: rules.md
criteriaRefs: [SPEC-NNN-AC-MMM]
consumerSpecs: [SPEC-NNN]
decisionRefs: [ADR-NNN]
```

Las listas de consumidores pueden proyectarse desde referencias; no duplican autoridad.

## Línea base y migración

- 226 archivos `rules.md`.
- 0 con IDs canónicos `SPEC-NNN-RULE-MMM`.
- 3 con IDs propios legacy: SPEC-001, SPEC-004 y SPEC-023.
- 43 aliases legacy a preservar.
- 223 sin IDs propios identificables.

Migración por bloque:

1. clasificar statements normativos y no normativos;
2. dividir reglas compuestas;
3. asignar IDs canónicos;
4. mapear aliases existentes;
5. enlazar criterios y consumidores;
6. registrar supersessions/retiros;
7. revisar el diff semántico.

No se numeran referencias a ADR/SPK como si fueran reglas.

## Validaciones

- ID propio coincide con directorio.
- Unicidad global de ID y alias.
- Alias resuelve a exactamente un ID canónico.
- Regla activa posee criterio o justificación estática.
- Referencias apuntan a reglas existentes y compatibles.
- Supersession identifica successor y decisión.

## Criterios de salida

- [ ] Los 226 `rules.md` poseen IDs canónicos.
- [ ] Los 43 aliases legacy resuelven sin colisiones.
- [ ] Reglas activas enlazan criterios o justificación.
- [ ] Cero referencias ADR/SPK clasificadas como regla.

Los checks permanecen abiertos.

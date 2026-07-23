# Contrato de identidad y fuerza normativa de requisitos — SPEC-225

## Propósito

`specification.md` define capacidades y restricciones normativas. Cada requisito necesita identidad y
fuerza explícita para distinguir obligación, recomendación, permiso, explicación y ejemplo.

## Identidad

Formato:

```text
SPEC-NNN-REQ-MMM
```

- `NNN` coincide con la spec propietaria.
- `MMM` es secuencial de tres dígitos, único y no reutilizable.
- La definición autoritativa vive en `specification.md`.

Ejemplo:

```markdown
- **SPEC-010-REQ-001 (MUST):** La API deriva `tenantId` del contexto autenticado.
```

## Fuerza normativa

| Keyword | Semántica |
| --- | --- |
| `MUST` / `DEBE` | obligación necesaria para conformidad |
| `MUST NOT` / `NO DEBE` | prohibición necesaria para conformidad |
| `SHOULD` / `DEBERÍA` | recomendación; desviarse exige razón y revisión |
| `SHOULD NOT` / `NO DEBERÍA` | práctica desaconsejada; desviarse exige razón |
| `MAY` / `PUEDE` | opción permitida, no obligatoria |

El keyword se serializa explícitamente junto al ID. “Se espera”, “idealmente”, “normalmente” o
futuro simple no sustituyen fuerza normativa.

## Tipos

| Tipo | Uso |
| --- | --- |
| `FUNCTIONAL` | capacidad o comportamiento observable |
| `QUALITY` | seguridad, rendimiento, accesibilidad, confiabilidad, mantenibilidad |
| `CONSTRAINT` | límite tecnológico, legal, comercial o de compatibilidad |
| `DATA` | integridad, ownership, retención o schema observable |
| `INTERFACE` | API, evento, comando, adapter o protocolo |
| `OPERATIONAL` | deployment, monitoreo, recovery o soporte |

El tipo no altera la fuerza.

## Requisito versus regla

- Requisito: capacidad/restricción que la solución debe satisfacer.
- Regla: invariante del dominio o boundary que permanece verdadero.

Un requisito puede implementar varias reglas y una regla puede afectar varios requisitos. Se enlazan
mediante `ruleRefs`; no se duplican textos para forzar una relación uno-a-uno.

## Schema lógico

```yaml
id: SPEC-NNN-REQ-MMM
type: FUNCTIONAL | QUALITY | CONSTRAINT | DATA | INTERFACE | OPERATIONAL
strength: MUST | MUST_NOT | SHOULD | SHOULD_NOT | MAY
statement: <obligación atómica>
objectiveRefs: [SPEC-NNN-OBJ-MMM]
ruleRefs: [SPEC-NNN-RULE-MMM]
criteriaRefs: [SPEC-NNN-AC-MMM]
decisionRefs: [ADR-NNN]
status: ACTIVE | DEPRECATED | SUPERSEDED | RETIRED
```

## Atomicidad

Un requisito contiene una sola obligación evaluable. Se divide cuando:

- combina actores o boundaries independientes;
- mezcla comportamiento y calidad con evidencia distinta;
- une MUST y SHOULD;
- una parte puede cambiar sin alterar las demás;
- requiere criterios/outcomes diferentes.

Listas de campos pueden permanecer juntas si forman un schema atómico versionado.

## Contenido no normativo

Ejemplos, rationale, diagramas y notas se rotulan como tales y no reciben ID de requisito. Un ejemplo
no amplía el contrato; si revela una obligación, ésta se expresa separadamente.

Los snippets de código son ilustrativos salvo que se declaren schema/interface normativa y tengan
versionado/compatibilidad definidos.

## Lifecycle

Cambios editoriales conservan ID. Cambiar fuerza, actor, boundary, outcome o compatibilidad crea otro
requisito o una revisión explícita con análisis de impacto.

`SUPERSEDED` identifica successors. `RETIRED` requiere decisión y revisión de consumidores.

La revisión del contrato y su compatibilidad con consumidores se rigen por
`contract-version-compatibility-contract.md`.

Los boundaries que satisfacen requisitos se identifican según `structure-boundary-contract.md`.

## Línea base

- 226 archivos `specification.md`.
- 0 con IDs propios `SPEC-NNN-REQ-MMM`.
- 28 contienen keywords normativos detectables.
- 198 no contienen esos keywords; es señal para clasificar el texto, no fallo automático.

## Migración

1. Separar contenido normativo, rationale y ejemplos.
2. Identificar requisitos atómicos.
3. Asignar fuerza y tipo.
4. Asignar IDs estables.
5. Enlazar objetivos, reglas, criterios y ADRs.
6. Registrar ambigüedades como findings.
7. Revisar compatibilidad y consumidores por bloque.

No se antepone `MUST` mecánicamente a cada bullet.

## Validaciones

- ID propio coincide con directorio y es único.
- Todo requisito activo posee fuerza/tipo.
- Cada MUST/MUST_NOT enlaza al menos un criterio o justificación estática.
- SHOULD omitido registra razón.
- Referencias y successors existen.
- Ejemplos no introducen obligaciones exclusivas.

## Criterios de salida

- [ ] Las 226 specifications poseen requisitos identificables.
- [ ] Cero obligaciones ambiguas sin fuerza normativa.
- [ ] Requisitos enlazan objetivos, reglas y criterios.
- [ ] Rationale/ejemplos están separados del contrato.

Los checks permanecen abiertos.

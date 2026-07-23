# Contrato de objetivos y outcomes — SPEC-225

## Propósito

`objective.md` explica por qué existe una spec, qué outcome debe producir y qué queda fuera. Es la
fuente para evaluar valor y alcance, no un resumen de la solución elegida.

## Identidad

Formato:

```text
SPEC-NNN-OBJ-MMM
```

- `NNN` coincide con la spec propietaria.
- `MMM` es secuencial de tres dígitos y no se reutiliza.
- Cada ID representa un outcome independiente.

Ejemplo:

```markdown
## SPEC-010-OBJ-001 — Crear sucursales sin aceptar tenant context del cliente HTTP
```

## Contenido mínimo

Cada outcome declara:

```yaml
id: SPEC-NNN-OBJ-MMM
problem: <situación/actor afectado>
outcome: <cambio observable deseado>
inScope: [<incluido>]
outOfScope: [<excluido>]
successSignals: [<señales/medidas>]
constraints: [<límites relevantes>]
ruleRefs: [SPEC-NNN-RULE-MMM]
```

La solución técnica, proveedor, tablas o endpoints sólo aparecen como constraints cuando ya existe
una decisión autoritativa; no se presentan como objetivo.

## Outcome versus output

- Outcome: cambio observable en capacidad, riesgo, decisión u operación.
- Output: archivo, endpoint, tabla, componente o tarea producida.

Un output puede habilitar el outcome, pero “crear API”, “hacer CRUD” o “documentar” no basta como
objetivo salvo que el valor sea precisamente contractual/documental.

## Alcance y exclusiones

`inScope` delimita actores, journeys, datos y boundaries cubiertos. `outOfScope` evita expectativas
implícitas y no se usa para ocultar requisitos necesarios del outcome.

Mover algo fuera de scope conserva razón, impacto, dependientes y decisión. Un cambio material
reabre prioridad, fase y criterios.

## Señales de éxito

Las señales deben ser proporcionales al tipo de spec:

- dominio/API/evento: comportamiento, invariantes, compatibilidad y casos negativos;
- seguridad/privacidad: amenazas/control/evidencia y riesgo residual;
- operación/plataforma: SLI, recovery, costo, portabilidad o reproducibilidad;
- UX/producto: journey, accesibilidad, error recovery y resultado del usuario;
- gobernanza: cobertura, trazabilidad y decisiones sin ambigüedad.

No se inventan KPIs, porcentajes o plazos sin baseline, fuente y owner. Cuando una medida cuantitativa
no sea apropiada, se usa una señal cualitativa binaria verificable.

## Preguntas abiertas

Una pregunta no resuelta se registra como decision/finding y puede bloquear el outcome. No se
redacta una pregunta como si fuera señal de éxito.

Cada pregunta crítica declara owner, evidencia requerida, deadline/gate y efecto si no se resuelve.

## Lifecycle

| Estado | Semántica |
| --- | --- |
| `ACTIVE` | outcome vigente |
| `SUPERSEDED` | reemplazado por otros IDs |
| `RETIRED` | removido del alcance mediante decisión |

Editar claridad conserva ID; cambiar actor, problema, outcome o señal esencial crea otro.

## Trazabilidad

La cadena mínima es:

```text
OBJ → REQ/RULE → AC → TSK → EVIDENCE
```

- Un objetivo enlaza al menos una regla o explica por qué es puramente exploratorio.
- Los requisitos expresan capacidades/restricciones con fuerza normativa.
- Las reglas operacionalizan el outcome.
- Los criterios demuestran reglas.
- Las tareas producen cambios/evidencia.
- La evidencia registra outcomes sobre commit exacto.

No se exige una relación uno-a-uno.

## Línea base

- 226 archivos `objective.md`.
- 0 con IDs propios `SPEC-NNN-OBJ-MMM`.
- 198 poseen menos de 80 palabras; es una señal de revisión, no un fallo automático.
- 7 contienen lenguaje explícito de medición; ausencia de esa terminología no prueba que no exista
  un outcome verificable.

## Migración

1. Identificar problema, actor y outcome actuales.
2. Separar outputs/soluciones del resultado deseado.
3. Declarar alcance y exclusiones.
4. Asignar IDs estables.
5. Enlazar reglas y señales.
6. Registrar preguntas como findings/decisiones.
7. Revisar por bloque sin imponer métricas ficticias.

## Criterios de salida

- [ ] Los 226 objetivos poseen IDs estables.
- [ ] Cada outcome diferencia resultado de output.
- [ ] Alcance, exclusiones y señales son explícitos.
- [ ] Objetivos enlazan reglas o justifican exploración.
- [ ] Preguntas críticas poseen decisión/gate.

Los checks permanecen abiertos.

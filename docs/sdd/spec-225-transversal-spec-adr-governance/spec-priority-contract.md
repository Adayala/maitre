# Contrato de prioridad de specs — SPEC-225

## Alcance

Este contrato gobierna el campo `Prioridad` de una spec. No gobierna:

- severidad de findings o vulnerabilidades;
- prioridad de tickets, comandas, waitlist o colas de runtime;
- orden numérico de los IDs;
- fase o incremento de entrega;
- estado, readiness o aprobación.

Esas dimensiones pueden correlacionarse, pero no se derivan automáticamente entre sí.

## Valores

| Valor | Significado | Regla de planificación |
| --- | --- | --- |
| `P0` | imprescindible para seguridad, cumplimiento, viabilidad del incremento activo o desbloqueo de su ruta crítica | debe resolverse, bloquearse explícitamente o retirarse del alcance antes del gate afectado |
| `P1` | necesario para el MVP/incremento comprometido, sin bloquear por sí solo la seguridad o viabilidad inmediata | se planifica dentro del incremento o se reprograma con impacto aceptado |
| `P2` | valioso y compatible con el producto, pero no comprometido en el incremento activo | puede diferirse sin invalidar el gate actual |
| `P3` | exploratorio, optimización o extensión opcional | no consume capacidad comprometida salvo decisión explícita |
| `UNASSIGNED` | todavía no existe decisión autorizada y trazable | bloquea comprometer fecha/alcance para esa spec, pero no inventa urgencia |

## Criterios de decisión

La propuesta registra al menos:

- incremento o gate afectado;
- impacto de no realizarla;
- dependencia que bloquea o habilita;
- riesgo de seguridad, privacidad, dinero, fiscalidad o trabajo;
- urgencia temporal externa verificable;
- costo de demora y alternativa de alcance;
- incertidumbre que requiera spike antes de comprometer.

Una única etiqueta como “core”, “MVP”, “transversal” o “importante” no basta para asignar P0/P1.

## Reglas de clasificación

### P0

Se usa cuando existe al menos una condición demostrable:

- sin la spec no puede cumplirse un criterio del incremento activo;
- protege aislamiento, autorización o integridad de dinero/datos en un flujo incluido;
- responde a una obligación fiscal, laboral, contractual o de privacidad vigente;
- desbloquea una decisión o dependencia en la ruta crítica;
- mitiga un riesgo con impacto crítico y sin control alternativo aceptado.

P0 no significa “implementar primero” si antes requiere ADR, spike, owner o evidencia externa.

### P1

Se usa cuando la capacidad está comprometida para el incremento/MVP, pero su ausencia admite una
secuencia segura o una degradación temporal aceptable y documentada.

### P2 y P3

P2 conserva valor de producto concreto fuera del compromiso activo. P3 identifica exploración,
optimización o extensión cuya exclusión no altera el outcome comprometido. Ninguna de las dos
autoriza trabajo por disponibilidad informal.

## Autoridad y evidencia

El Product Owner propone o acepta impacto y secuencia. El Domain Owner valida dependencias e
invariantes. Para P0 por riesgo especializado se requiere además reviewer competente.

Cada decisión registra:

```yaml
spec: SPEC-NNN
from: P0 | P1 | P2 | P3 | UNASSIGNED
to: P0 | P1 | P2 | P3
reason: <impacto verificable>
affectedIncrement: <SPEC-222 I0..I6 o N/A>
dependencies: [<IDs>]
decidedBy: <asignación ACCEPTED>
reviewedBy: [<asignaciones requeridas>]
effectiveFrom: <commit/ref>
reviewAt: <fecha, gate o cambio de alcance>
```

La prioridad efectiva se refleja en el README y `SPECS.md` dentro del mismo cambio.

## Revisión y cambio

Se reevalúa cuando cambia el alcance de SPEC-222, una dependencia, una obligación externa, la
evidencia de riesgo o el incremento activo. Subir o bajar prioridad conserva la decisión anterior y
explica el impacto.

No se reduce una P0 para liberar un gate: se resuelve la causa, se acepta una excepción con owner y
vencimiento, o se retira explícitamente el flujo afectado del alcance.

## Estado actual

Los README raíz versionados declaran 51 `P0`, 18 `P1` y 21 `UNASSIGNED`. Este contrato define cómo
decidir las 21 pendientes, pero no aporta la autoridad ni evidencia necesarias para asignarlas.

## Criterios de salida

- [ ] Las 21 prioridades versionadas pendientes poseen decisión registrada.
- [ ] Todo P0 enlaza gate/impacto y owner efectivo.
- [ ] `SPECS.md` y README permanecen sincronizados.
- [ ] Cambios de fase o alcance disparan revisión de prioridad.

Ningún criterio se marca sin revisión humana verificable.

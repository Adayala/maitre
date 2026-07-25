# Especificación — SPEC-121 Payroll Projection

Función pura sobre intervalos aprobados + adjustment chain + LaborPolicyVersion. Produce minutos
regulares, pausas, extras, nocturnidad y trazabilidad de motivos usando decimal y timezone IANA; no liquida
salarios ni afirma cumplimiento legal.

Resultado guarda input hash, policy version, calculation version y redondeos. Una corrección crea
nueva projection vinculada; resultados exportados permanecen inmutables y reciben delta
retroactivo. Sin policy aplicable devuelve `NOT_CONFIGURED`, no ceros ni estimación silenciosa.

## Snapshot de input aprobado

La proyección usa un snapshot explícito e inmutable al momento del cálculo.

`PayrollProjectionInput` incluye:

- `tenantId`
- `branchId`
- `employmentId`
- `timezone`
- `businessDate` o rango proyectado explícito
- cadena aprobada de `TimeEntry` y `BreakLog` ya normalizados a intervalos efectivos
- adjustment chain aprobada (`TimeAdjustment` / `BreakAdjustment`) en orden causal
- `laborPolicyVersion`
- `calculationVersion`
- metadata de feriados/calendario aplicada por versión de policy o referencia explícita

No forman parte del cálculo puro:

- permisos/RBAC del actor
- step-up/export authorization
- liquidación monetaria final
- disponibilidad de un export externo

Regla aprobada para I0:

- el cálculo nunca lee estado mutable “live” durante su ejecución
- primero se congela el snapshot; luego se calcula
- dos cálculos con el mismo snapshot deben producir exactamente el mismo resultado

## Normalización de intervalos

Antes de clasificar minutos, los inputs aprobados se normalizan en una línea temporal única en la
timezone IANA del cálculo.

Regla aprobada para I0:

- `TimeEntry` aprobado define presencia base trabajada
- `BreakLog` aprobado define subintervalos de pausa pagas/no pagas
- ajustes aprobados reemplazan el tramo lógico afectado, preservando provenance append-only
- solapamientos inválidos en el snapshot no se corrigen silenciosamente; deben producir resultado
  bloqueado o error de cálculo según la capa que invoque la proyección
- cruces de medianoche y DST se resuelven siempre en tiempo zonal, nunca con heurísticas UTC-only

## Categorías de resultado

`PayrollProjectionResult` distingue al menos:

- `regularMinutes`
- `paidBreakMinutes`
- `unpaidBreakMinutes`
- `overtimeMinutes`
- `nightMinutes`
- `blockedMinutes` cuando una regla exige excluir o marcar un tramo no computable

Cada categoría expone:

- total decimal/minutal
- tramos fuente que contribuyeron
- reglas aplicadas
- redondeos aplicados

Regla aprobada para I0:

- `nightMinutes` puede superponerse analíticamente con `regularMinutes` u `overtimeMinutes`; no se
  interpreta como bucket mutuamente excluyente sino como atributo/proyección explicable del tiempo
- pausas pagas y no pagas se distinguen siempre; nunca se colapsan en un único total opaco

## Trace model y provenance

El resultado debe ser explicable sin recalcular mentalmente la policy.

`PayrollProjectionResult` guarda:

- `inputHash`
- `calculationVersion`
- `laborPolicyVersion`
- `generatedAt`
- `sourceSnapshotRef` o identidad estable equivalente
- `ruleTrace[]`
- `roundingTrace[]`
- `retroactiveDeltaFromProjectionId?`
- `exportLinks[]` o linkage equivalente

`ruleTrace[]` explica:

- regla aplicada
- tramo afectado
- motivo
- categoría impactada
- versión de policy/provenance

`roundingTrace[]` explica:

- valor previo
- regla de redondeo
- valor posterior
- nivel donde se aplicó (tramo, categoría, total)

## Redondeo y decimalidad

Regla aprobada para I0:

- la aritmética base es decimal/minutal determinista; no se usa float binario como verdad de negocio
- el redondeo debe declararse explícitamente por policy o por versión de cálculo
- no se permite redondeo implícito “al final porque sí”
- si una policy no define regla aplicable, el cálculo queda `NOT_CONFIGURED` para esa dimensión

## Retroactivos y exportados

Una nueva aprobación no reescribe una proyección ya exportada.

Regla aprobada para I0:

- si cambia el snapshot por una corrección aprobada, se genera una nueva projection
- la nueva projection referencia a la projection previa cuando exista
- si una projection previa ya fue exportada, la nueva no la muta: genera delta retroactivo
  reconciliable
- la reconciliación debe poder explicar: base previa, nuevo cálculo, delta resultante y motivo

## `NOT_CONFIGURED`

`NOT_CONFIGURED` es un resultado explícito, no una excepción silenciosa ni un cero “de cortesía”.

Debe usarse cuando falte cualquiera de estos mínimos:

- `laborPolicyVersion` resoluble
- timezone válida
- regla de overtime/nocturnidad/redondeo requerida para afirmar el resultado
- calendario/feriado requerido por la policy aplicable

Cuando devuelve `NOT_CONFIGURED`, el resultado debe incluir:

- razón bloqueante
- dimensión afectada
- evidencia mínima para diagnóstico

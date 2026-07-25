# Especificación — SPEC-123 Labor Compliance Rules

LaborPolicyVersion contiene jurisdicción, fuente oficial/documento, fecha de consulta, vigencia,
hash, reviewer competente, aprobación, supersession, fixtures y disclaimer. Reglas tenant sólo
pueden ser más restrictivas cuando la policy lo permita y conservan provenance.

El evaluador genera findings `INFO | WARNING | BLOCKING` explicables, con rule version, evidence y
occurrence date. No sanciona, despide, modifica TimeEntry ni decide automáticamente una cuestión
laboral. Sin jurisdicción/policy aprobada retorna `NOT_CONFIGURED` y bloquea toda afirmación de
cumplimiento, manteniendo captura y evidencia.

## Modelo de `LaborPolicyVersion`

Cada `LaborPolicyVersion` debe congelar al menos:

- `jurisdictionCode`
- `sourceType` (`OFFICIAL`, `COUNSEL`, `INTERNAL_APPROVED_REFERENCE`)
- `sourceRef` o documento enlazable
- `consultedAt`
- `effectiveFrom`
- `effectiveUntil?`
- `contentHash`
- `reviewerRef`
- `approvedAt`
- `supersedesPolicyVersionId?`
- `policyCapabilities`
- `fixturesVersion`
- disclaimer y límites interpretativos

`policyCapabilities` declara explícitamente qué dimensiones cubre la policy:

- descansos
- máximos diarios
- máximos semanales
- nocturnidad
- feriados/calendario
- menores cuando aplique
- overlays tenant permitidos o no

Regla aprobada para I0:

- una policy no puede asumirse “completa” por nombre; debe declarar capacidades cubiertas
- si una dimensión requerida no está cubierta por la policy efectiva, la evaluación queda
  `NOT_CONFIGURED` para esa dimensión

## Overlays tenant

Un tenant puede agregar reglas propias sólo cuando la policy base lo permite expresamente.

`TenantLaborOverlay` debe conservar:

- `tenantId`
- `basePolicyVersionId`
- dimensión afectada
- regla/umbral propuesto
- justificación/provenance
- aprobador competente
- vigencia

Regla aprobada para I0:

- overlays tenant sólo pueden endurecer una regla, nunca flexibilizarla
- si una policy base prohíbe overlays para cierta dimensión, cualquier overlay en esa dimensión es inválido
- overlay y policy base deben evaluarse juntos y dejar trace separada

## Inputs del evaluador

La evaluación de compliance se hace sobre evidencia aprobada o snapshots estables.

`ComplianceEvaluationInput` incluye:

- snapshot de jornadas/pausas aprobadas o projection estable equivalente
- `employmentId`
- `branchId`
- `timezone`
- `occurrenceDate` o rango evaluado
- `LaborPolicyVersion`
- overlays tenant válidos para ese scope
- calendario/feriados aplicables
- metadatos de excepciones documentadas

No forman parte del evaluador:

- sanciones
- payroll monetario final
- mutación de evidencia base
- decisiones de RRHH/despido/suspensión

## Taxonomía de findings

El evaluador produce findings:

- `INFO`
- `WARNING`
- `BLOCKING`

Cada finding debe incluir:

- `ruleCode`
- `severity`
- `occurrenceDate`
- `evaluatedAt`
- `policyVersionId`
- `overlayId?`
- evidencia relevante
- explicación legible
- `requiresHumanReview`

Semántica aprobada para I0:

- `INFO` describe observaciones o trazas sin incumplimiento operativo
- `WARNING` indica posible incumplimiento o riesgo que no invalida evidencia
- `BLOCKING` impide afirmar cumplimiento o continuar cierto flujo derivado de compliance
- todo finding laboral sensible requiere `requiresHumanReview = true`; el sistema nunca ejecuta la
  acción humana derivada

## Occurrence date, vigencia y retroactividad

La evaluación distingue entre:

- fecha/intervalo de ocurrencia del hecho laboral
- vigencia normativa aplicable a esa ocurrencia
- fecha en que el sistema evaluó o reevaluó el hecho

Regla aprobada para I0:

- la policy aplicable se determina por la fecha de ocurrencia, no por “la policy actual”
- una nueva `LaborPolicyVersion` no reescribe findings históricos ya emitidos
- una reevaluación retroactiva crea nuevos findings vinculados con provenance explícita
- debe poder explicarse por qué un mismo hecho tuvo distinta evaluación antes y después de una
  corrección o cambio de policy

## Frontera con planificación, payroll y evidencia

El evaluador de compliance no reemplaza otros subsistemas.

- no corrige `TimeEntry`, `BreakLog`, `TimeAdjustment` ni `BreakAdjustment`
- no calcula importes salariales finales; sólo reglas/finding de cumplimiento
- no reemplaza la `PayrollProjection`; puede alimentarla o bloquear afirmaciones asociadas
- no reemplaza RBAC/step-up/export; esos controles viven en SPEC-122

## `NOT_CONFIGURED`

`NOT_CONFIGURED` significa que el sistema no puede afirmar cumplimiento en forma responsable.

Debe aplicarse cuando falte cualquiera de estos mínimos:

- policy aprobada para la jurisdicción/fecha
- capacidad requerida dentro de la policy
- timezone o calendario necesario
- overlay provenance válida cuando el tenant depende de ella para endurecer una regla

Cuando ocurre `NOT_CONFIGURED`, el sistema:

- conserva la evidencia capturada
- permite revisión humana posterior
- bloquea la afirmación positiva de cumplimiento
- debe emitir explicación diagnóstica, no silencio

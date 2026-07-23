# Catálogo de fixtures SDBP v1 — SPEC-225

## Propósito

Especificar casos de conformidad para el
[policy profile de deuda](validation-debt-policy-profile-contract.md), sin aprobarlo, materializar
configuración ni habilitar excepciones.

## Envelope

```yaml
id: SDBP-FIX-NNN
kind: POSITIVE | NEGATIVE
input:
  policy: <profile sintético>
  subject: <baseline/exception sintética|null>
  assignments: <authority refs sintéticas>
  clock: <UTC congelado>
expected:
  valid: <bool>
  code: <SDBP001..SDBP012|null>
  effectivePolicyId: <ID|null>
  writes: 0
  networkRequests: 0
```

Los casos usan IDs, commits, hashes, personas y fechas ficticias. Ningún fixture asigna autoridad
real ni cambia `exception.enabled`.

## Casos positivos

| ID | Escenario | Resultado esperado |
| --- | --- | --- |
| `SDBP-FIX-001` | Profile completo en estado propuesto | válido, no efectivo |
| `SDBP-FIX-002` | Profile aprobado con ID/hash/review exactos | única policy efectiva |
| `SDBP-FIX-003` | Baseline histórico `MEDIUM` dentro de 180 días | elegible para review |
| `SDBP-FIX-004` | Excepción `MEDIUM` expira exactamente a 30 días | dentro del máximo |
| `SDBP-FIX-005` | Excepción `LOW` expira exactamente a 60 días | dentro del máximo |
| `SDBP-FIX-006` | Excepción `WARNING` expira exactamente a 90 días | dentro del máximo |
| `SDBP-FIX-007` | Roles mínimos son identidades separadas y aceptadas | authority válida |
| `SDBP-FIX-008` | Primera renovación dura 30 días con reviewer superior | válida |
| `SDBP-FIX-009` | Restricción nueva migra approvals vigentes explícitamente | válida |
| `SDBP-FIX-010` | Policy superseded preserva predecessor/hash | válida |
| `SDBP-FIX-011` | Inputs permutados y timezone distinto | mismo resultado UTC |
| `SDBP-FIX-012` | Evaluación read-only/offline | cero writes y cero red |

## Identidad y resolución

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBP-FIX-013` | ID/schema/status inválido o ausente | `SDBP001` |
| `SDBP-FIX-014` | ID/version reutilizada con contenido distinto | `SDBP001` |
| `SDBP-FIX-015` | Profile aprobado sin review/approved commit | `SDBP001` |
| `SDBP-FIX-016` | Gate requerido no resuelve policy | `SDBP002` |
| `SDBP-FIX-017` | Dos policies se declaran efectivas | `SDBP002` |
| `SDBP-FIX-018` | Config parcial hereda defaults ocultos | `SDBP002` |
| `SDBP-FIX-019` | ID coincide pero policy hash difiere | `SDBP002` |

## Severidad y vigencia

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBP-FIX-020` | `BLOCKER` se habilita para baseline/excepción | `SDBP003` |
| `SDBP-FIX-021` | `HIGH` se habilita sin nueva policy aprobada | `SDBP003` |
| `SDBP-FIX-022` | Categoría no exceptuable entra por severity baja | `SDBP003` |
| `SDBP-FIX-023` | Solicitante reduce severity para cumplir policy | `SDBP003` |
| `SDBP-FIX-024` | `MEDIUM` excede 30 días iniciales | `SDBP004` |
| `SDBP-FIX-025` | `LOW/WARNING` excede 60/90 días | `SDBP004` |
| `SDBP-FIX-026` | Vigencia se calcula desde merge/consumo y no decisión | `SDBP004` |
| `SDBP-FIX-027` | Excepción usa milestone sin fecha en lugar de expiry | `SDBP004` |

## Autoridad y renovación

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBP-FIX-028` | Una identidad satisface múltiples roles incompatibles | `SDBP005` |
| `SDBP-FIX-029` | Assignment ausente, rechazado o expirado cuenta | `SDBP005` |
| `SDBP-FIX-030` | Grupo opaco cuenta sin miembros/autoridad verificable | `SDBP005` |
| `SDBP-FIX-031` | Bot/CI/maintainer acepta riesgo | `SDBP005` |
| `SDBP-FIX-032` | Segunda renovación se permite | `SDBP006` |
| `SDBP-FIX-033` | Renovación excede 30 días o límite inicial | `SDBP006` |
| `SDBP-FIX-034` | Reviewer anterior se presenta como superior | `SDBP006` |
| `SDBP-FIX-035` | Finding se divide para evadir límite de renovación | `SDBP006` |

## Activación y versionado

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBP-FIX-036` | Exceptions se habilita antes de aprobar fixtures/repositorio | `SDBP007` |
| `SDBP-FIX-037` | Ratchet required se activa antes del baseline revisado | `SDBP007` |
| `SDBP-FIX-038` | Valores propuestos se usan como defaults efectivos | `SDBP007` |
| `SDBP-FIX-039` | Ampliar duración/elegibilidad edita policy activa | `SDBP008` |
| `SDBP-FIX-040` | Restricción nueva ignora approvals vigentes | `SDBP008` |
| `SDBP-FIX-041` | Successor omite `supersedes` o predecessor | `SDBP008` |
| `SDBP-FIX-042` | Migración pierde policy IDs/hashes previos | `SDBP008` |

## Bypass, enforcement y seguridad

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBP-FIX-043` | Flag `--ignore-policy` altera outcome | `SDBP009` |
| `SDBP-FIX-044` | Env/branch/label/comment habilita exceptions | `SDBP009` |
| `SDBP-FIX-045` | Ausencia cae a policy embebida/allow-all | `SDBP009` |
| `SDBP-FIX-046` | Emergencia reescribe resultado del validator | `SDBP009` |
| `SDBP-FIX-047` | Baseline supera severity/expiry/count efectivos | `SDBP010` |
| `SDBP-FIX-048` | Excepción supera duration/renewal efectivos | `SDBP010` |
| `SDBP-FIX-049` | Consumer usa policy distinta a la reportada | `SDBP010` |
| `SDBP-FIX-050` | Config/métrica incluye secreto, PII o source sensible | `SDBP011` |
| `SDBP-FIX-051` | Actor no autorizado obtiene assignments/evidence restringida | `SDBP011` |
| `SDBP-FIX-052` | Path/symlink de policy escapa del root | `SDBP011` |

## Determinismo

| ID | Mutación | Código |
| --- | --- | --- |
| `SDBP-FIX-053` | Timezone/locale altera expiry | `SDBP012` |
| `SDBP-FIX-054` | Clock cambia durante una evaluación | `SDBP012` |
| `SDBP-FIX-055` | Orden de assignments cambia authority outcome | `SDBP012` |
| `SDBP-FIX-056` | Orden de inputs altera hash/reporte | `SDBP012` |

## Cobertura

| Código | Fixtures |
| --- | --- |
| `SDBP001` | 013–015 |
| `SDBP002` | 016–019 |
| `SDBP003` | 020–023 |
| `SDBP004` | 024–027 |
| `SDBP005` | 028–031 |
| `SDBP006` | 032–035 |
| `SDBP007` | 036–038 |
| `SDBP008` | 039–042 |
| `SDBP009` | 043–046 |
| `SDBP010` | 047–049 |
| `SDBP011` | 050–052 |
| `SDBP012` | 053–056 |

Cada código tiene al menos tres casos negativos. Los 12 positivos fijan resolución correcta, límites
inclusivos, authority válida, versionado y operación segura.

## Materialización futura

- Congelar clock, locale, timezone, commit, policy ID y hashes.
- Modelar assignments/authority hierarchy con identidades sintéticas separadas.
- Verificar límites inclusivos y casos inmediatamente anterior/posterior al vencimiento.
- Ejecutar sin red, sin writes y sin leer configuración exterior al árbol fixture.
- Comparar outcome, policy efectiva, diagnostics, hash y métricas normalizadas.
- La materialización no aprueba `SDD-DEBT-POLICY-001`.

## Estado

```yaml
catalogId: SDBP-FIXTURE-CATALOG-V1
specifiedCases: 56
positiveCases: 12
negativeCases: 44
publicCodesCovered: 12
materializedCases: 0
executedCases: 0
policyApproved: false
exceptionEnabled: false
```

# Revisión de contratos — Workforce SPEC-111–123

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-111–123 |
| Commit revisado | `e239537` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El bloque diferencia planificación, asignación, fichada y pausa; conserva timestamps del
servidor/dispositivo, no reescribe correcciones y segrega solicitud/aprobación. El cálculo es
explicable, versionado y explícitamente no liquida salarios; compliance exige revisión humana.

La aprobación queda bloqueada por metadata provisoria, ausencia de una autoridad para la
relación laboral y falta de gobierno verificable de políticas por jurisdicción.

## Findings bloqueantes

### WF-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-111–123 mantienen type, phase y priority `TBD`, sin owner/reviewer ni
  dependencias autoritativas.
- Resolución: normalizar trece README con SPEC-225, asignar responsables legales/producto y
  registrar outcome contra commit exacto.

### WF-REV-002 — Empleado/relación laboral sin autoridad definida

- Severidad: alta.
- Evidencia: ShiftAssignment, TimeEntry y RBAC dependen de employee activo, relación laboral,
  rol y sucursal, pero User/Membership no modela necesariamente empleo, legajo o vigencias.
- Riesgo: una membership revocada, contratista o transferencia puede producir fichadas y acceso
  inconsistentes.
- Resolución: definir port/agregado autoritativo mínimo para employment relation, vigencia,
  branch eligibility e identificadores, separado de identidad/autenticación.

### WF-REV-003 — Políticas laborales sin provenance/aprobación suficiente

- Severidad: alta.
- Evidencia: cálculo/compliance reciben política versionada por jurisdicción, pero no definen
  fuente, effective dates, aprobación experta, supersession ni manejo de jurisdicción ausente.
- Riesgo: presentar horas extra o findings incorrectos como cumplimiento legal.
- Resolución: crear governance de policy con provenance, reviewer competente, vigencia,
  fixtures, disclaimer y fail-safe; bloquear afirmaciones de cumplimiento sin configuración.

## Findings medios

### WF-REV-004 — `Shift` colisiona con `Service`

Shift laboral y Service gastronómico son ventanas distintas. Namespaces, IDs, eventos, métricas
y UI deben usar términos inequívocos; vincularlos sólo mediante assignment opcional explícito,
no por fecha/nombre.

### WF-REV-005 — Clock offline necesita protocolo de confianza

Definir commandId, deviceId seudónimo, capturedAt, receivedAt, monotonic sequence, tolerancia de
desfase y estado `PENDING_REVIEW` para marcas anómalas. El timestamp del dispositivo se conserva
como evidencia, pero no sustituye al servidor sin política.

### WF-REV-006 — Eventos ShiftStarted/Ended son ambiguos

“Comenzar lógicamente” puede significar inicio planificado, primer clock-in o comando manager.
Definir hecho exacto; conteos agregados deben suprimirse en equipos pequeños para no inferir
asistencia individual.

### WF-REV-007 — Correcciones requieren ledger y efecto retroactivo

ADJUSTED no debe ocultar original. Fijar adjustment entity/chain, aprobación, reason/evidence y
recomputación versionada de Payroll/Compliance sin mutar resultados ya exportados.

### WF-REV-008 — Roles laborales no son catálogo canónico

`employee`, `supervisor` y `payroll` deben mapear a permission assignments o roles versionados.
Datos de jornada/remuneración necesitan permisos sensibles separados y export auditable.

## Evidencia positiva

- Intervalos usan UTC y conservan timezone IANA; DST/medianoche tienen fixtures.
- Sólo una TimeEntry/Break abierta y conflictos se protegen con concurrencia.
- Correcciones preservan actor, motivo e historia.
- APIs usan commands idempotentes, `If-Match` y separan acceso propio/supervisor.
- El servidor conserva timestamp confiable y la marca original del dispositivo.
- Cálculo usa decimales, inputs/regras explícitos y no se presenta como liquidación.
- Compliance no borra evidencia ni automatiza decisiones laborales de alto impacto.
- Eventos omiten PII, fichadas y remuneración individual.

## Próxima revisión

Revisar después de resolver WF-REV-001–003. La evidencia debe incluir employment authority,
policy provenance, protocolo offline, adjustment ledger, tablas de transiciones y fixtures
dorados revisados para jurisdicción/DST.

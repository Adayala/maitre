# Contrato de respuesta a incidentes del validator SDD — SPEC-225

## Propósito

Definir cómo detectar, declarar, contener, comunicar, recuperar y cerrar incidentes del validator y
su gobernanza. Complementa disponibilidad/continuidad; no configura alertas ni asigna personas.

## Alcance

Incidentes cubiertos:

- validator unavailable en modo required/strict;
- bypass/fail-open o required check ausente;
- tampering de validator/config/baseline/policy/registry;
- writes o network access indebidos;
- filtración de secrets/PII en artifacts;
- clasificación sistemática errónea;
- drift entre activation manifest y enforcement efectivo;
- corrupción/pérdida de evidence de gobernanza.

Un finding normal del subject no es incidente salvo que revele una falla del control.

## Registro

```yaml
incidentId: SDD-INC-NNN
schemaVersion: 1
status: DETECTED | TRIAGED | CONTAINED | RECOVERING | RESOLVED | CLOSED | REOPENED
severity: SEV0 | SEV1 | SEV2 | SEV3
detectedAt: <UTC>
declaredAt: <UTC|null>
subject:
  activationId: <ID|null>
  mode: <mode>
  affectedCommits: [<sha>]
  componentRefs: [<ID + hash>]
classification:
  incidentType: <enum>
  securityRelevant: <bool>
  dataExposureSuspected: <bool>
ownership:
  incidentCommanderAssignment: <OWN|null>
  technicalLeadAssignment: <OWN|null>
  communicationsAssignment: <OWN|null>
timeline: [<event records>]
containment: [<actions/evidence>]
recovery: [<actions/evidence>]
impact: <assessment>
rootCauseRef: <record|null>
correctiveActionRefs: [<issues>]
closureReviewRef: <DOC-REV|null>
```

El record no contiene payloads sensibles; los referencia mediante evidence controlada.

## Severidad propuesta

| Nivel | Criterio mínimo |
| --- | --- |
| `SEV0` | control comprometido activamente, exposición confirmada o enforcement crítico falseado |
| `SEV1` | required/strict fail-open, tampering probable o outage material sin workaround seguro |
| `SEV2` | unavailable prolongado, drift relevante o clasificación sistemática incorrecta |
| `SEV3` | degradación acotada en shadow, alerta/artefacto no crítico |

Se usa el nivel más alto aplicable. Downgrade requiere rationale y evidencia; sospecha de
secret/PII/tampering se trata al menos como `SEV1` hasta descartar.

## Roles

- incident commander coordina decisiones y timeline;
- technical lead investiga/recupera;
- communications owner emite updates;
- security/privacy owner es obligatorio si hay sospecha relevante;
- governance reviewer verifica que containment no altere historia/policy;
- scribe puede registrar eventos sin decidir.

Los roles requieren assignments/capabilities vigentes. Un bot puede detectar, no comandar ni cerrar.
Si faltan assignees, el incidente permanece abierto y escala por relación `OWN-AUTH`.

## Estados y condiciones

| Transición | Condición |
| --- | --- |
| `DETECTED → TRIAGED` | tipo, severity, scope inicial y owner asignados |
| `TRIAGED → CONTAINED` | propagación/bypass detenidos y evidence preservada |
| `CONTAINED → RECOVERING` | plan aprobado y target verificado |
| `RECOVERING → RESOLVED` | servicio/control restaurado y backlog revalidado |
| `RESOLVED → CLOSED` | root cause, acciones y closure review completos |
| `CLOSED → REOPENED` | recurrencia/evidence nueva invalida cierre |

No se saltean estados. `RESOLVED` no equivale a `CLOSED`.

## Contención

Acciones permitidas según evidencia/autoridad:

- cancelar runs comprometidos;
- bloquear consumo de artifacts/evidence;
- revocar excepción/assignment comprometidos;
- pausar promoción de modos;
- aplicar rollback formal a activation verificada;
- rotar credenciales mediante proceso de seguridad externo;
- preservar hashes/logs/timeline.

Prohibido:

- editar/borrar evidence o history;
- actualizar baseline para ocultar findings;
- marcar check passed manualmente;
- publicar payloads sensibles en issue/chat;
- ejecutar scripts no revisados sobre el repo;
- reactivar antes de completar gates de recovery.

## Comunicación

Cadencia candidata:

```yaml
SEV0: initial 15m, updates 30m
SEV1: initial 30m, updates 60m
SEV2: initial 4h, updates daily
SEV3: initial 1 business day, updates as-needed
```

Los tiempos son propuestos hasta aprobar on-call/SLO. Cada update declara:

- incident ID/status/severity;
- impacto y alcance conocidos;
- containment/recovery state;
- próxima actualización;
- decisiones requeridas;
- sin secretos, especulación presentada como hecho ni identidades innecesarias.

Destinos internos/externos y obligaciones regulatorias permanecen `NOT_DECIDED`; cualquier
notificación legal/privacy sigue autoridad especializada.

## Evidence y cadena de custodia

Cada artifact registra:

```yaml
evidenceId: SDD-INC-EVD-NNNNN
incidentId: SDD-INC-NNN
type: LOG | REPORT | CONFIG | ARTIFACT | TIMELINE | ATTESTATION
sourceRef: <sistema/ref>
capturedAt: <UTC>
capturedBy: <identity/tool ref>
sha256: <hash>
classification: INTERNAL | RESTRICTED
retentionPolicyRef: <ref>
accessLogRef: <ref|null>
```

- captura read-only cuando sea posible;
- timestamps normalizados y clock source declarado;
- evidencia derivada enlaza parents;
- acceso restringido se audita;
- redacción crea artifact derivado, no sobrescribe original;
- ausencia de evidence se declara, no se reconstruye como hecho.

## Recovery

Requiere los gates del contrato de disponibilidad más:

1. vector de compromiso/falla contenido;
2. artifacts/config/registros restaurados desde hashes aprobados;
3. credentials/bindings afectados tratados fuera del repo;
4. fixtures/canaries incluyendo regresión del incidente;
5. dos runs deterministas;
6. commits afectados revalidados;
7. activation de recovery aplicada/verificada;
8. monitoring intensificado durante ventana aprobada.

## Root cause y acciones

Root cause distingue:

```text
TRIGGER | DIRECT_CAUSE | CONTRIBUTING_FACTOR | CONTROL_GAP | IMPACT
```

- no usa “error humano” como causa final;
- separa hechos de hipótesis;
- enlaza evidencia;
- corrective actions poseen owner, prioridad, due condition y verification;
- acciones no verificadas no permiten cerrar;
- recurrencia reabre y eleva review.

## Cierre

`CLOSED` requiere:

- impacto final y ventana confirmados;
- timeline consistente;
- evidence catalogada/retención asignada;
- recovery `VERIFIED`;
- root cause revisada;
- corrective actions aceptadas y blockers explícitos;
- comunicaciones finales;
- review independiente `DOC-REV`.

No exige que toda acción de largo plazo esté completada, pero sí tracking durable y riesgo residual
aceptado por autoridad competente.

## Códigos

| Código | Condición |
| --- | --- |
| `VINC001` | incident ID/schema/status/severity/type inválido |
| `VINC002` | detección/clasificación/scope/impact incorrecto |
| `VINC003` | ownership/capability/escalamiento insuficiente |
| `VINC004` | transición/timeline/cadencia inválida |
| `VINC005` | contención insegura o evidence/history alterada |
| `VINC006` | comunicación tardía, engañosa o sensible |
| `VINC007` | evidence/hash/custodia/retención/acceso inválido |
| `VINC008` | recovery/revalidation/activation insuficiente |
| `VINC009` | root cause/corrective action incompleta o no verificable |
| `VINC010` | cierre prematuro, stale o recurrencia no reabierta |
| `VINC011` | secret/PII/path inseguro o acceso indebido |
| `VINC012` | timeline/clasificación/reporte no determinista |

## Estado

```yaml
contractStatus: SPECIFIED_NOT_APPROVED
incidentRegistryPath: NOT_DECIDED
onCallAssignments: 0
alertDestinations: 0
approvedCadences: 0
incidentsCreated: 0
```

## Criterios de salida

- [x] Scope, record, severity, roles y lifecycle especificados.
- [x] Containment, comunicación, evidence y recovery especificados.
- [x] Root cause, acciones y cierre especificados.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `VINC`.
- [ ] Aprobar cadencias, destinos, retention y escalation.
- [ ] Asignar on-call/roles sin crear incidentes ficticios.

# Revisión de contratos — Kitchen SPEC-098–110

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-098–110 |
| Commit revisado | `6994f4c` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Station separa configuración de cola; ProductionQueue es reconstruible; alertas no modifican
Command; APIs usan transiciones versionadas; eventos minimizan contenido; el workflow exige
historial y outbox. Hay buenas bases para operación offline/realtime y recuperación.

La aprobación queda bloqueada porque Command y Kitchen State Machine definen vocabularios de
estado incompatibles, mientras KitchenTicket/Command todavía duplican ownership de producción.

## Findings bloqueantes

### KIT-REV-001 — Estados de Command y workflow incompatibles

- Severidad: alta.
- Evidencia: SPEC-098 define `QUEUED | ACKNOWLEDGED | IN_PROGRESS | COMPLETED | CANCELLED |
  FAILED`; SPEC-110 define `RECEIVED | CLAIMED | IN_PROGRESS | READY | COMPLETED`, más HOLD y
  CANCELLED. SPEC-104 opera claim/hold/resume/ready.
- Riesgo: persistencia, API, eventos y UI no pueden compartir una máquina determinista.
- Resolución: fijar un único enum y tabla de transiciones con mapping/migración; aclarar FAILED,
  HOLD, READY y diferencia entre recepción, claim y acknowledgement.

### KIT-REV-002 — KitchenTicket y Command duplican unidad de trabajo

- Severidad: alta.
- Evidencia: SPEC-086 contiene item states por estación; SPEC-098 vuelve a modelar target,
  payload, priority y status; SPEC-106 llama “comanda” al Command.
- Riesgo: cancelación, ready y reasignación pueden escribirse en dos agregados.
- Resolución: elegir agregado autoritativo y definir Ticket/Command/production unit/read model,
  identidades, cardinalidades y eventos sin traducciones implícitas.

### KIT-REV-003 — Metadata no aprobable

- Severidad: alta.
- Evidencia: SPEC-098–101 no tienen owner/reviewer/prioridad y SPEC-102–110 mantienen type,
  phase y priority `TBD` sin responsables/dependencias.
- Resolución: normalizar los trece README mediante SPEC-225 y asignar ownership.

## Findings medios

### KIT-REV-004 — READY y COMPLETED carecen de hecho operativo

SPEC-108 completa “todas las unidades” pero aclara que no es delivered. Definir si READY es
preparación terminada y COMPLETED es retiro por expediter, consolidación o cierre técnico;
identificar actor, timestamp, rollback excepcional e impacto en OrderReady.

### KIT-REV-005 — Payload genérico de Command debilita schemas

`type/target/payload versionado` necesita discriminated unions allowlisted por command type,
límites y compatibilidad. Evitar blobs libres que introduzcan PII, notas o lógica específica
fuera del dominio.

### KIT-REV-006 — Routing y repriorización requieren snapshots/política

Cada unidad debe registrar routingRulesVersion y priority reason aplicados. Repriorizar exige
permission, límites y explicación; el orden debe resistir starvation y relojes inconsistentes.

### KIT-REV-007 — Alertas: reapertura y detección no son deterministas aún

Definir rule version, evidence window, clock, dedupe identity y si una condición recurrente crea
nueva activation o reabre. Acknowledge/resolve/escalate deben converger ante carreras.

### KIT-REV-008 — Roles de Kitchen no son códigos canónicos

`kitchen operator` y `expediter` deben mapear a COOK/MAITRE o permission assignments versionados.
El turno activo requiere una fuente autoritativa y una política segura si Workforce no está
disponible.

## Evidencia positiva

- Station no embebe una cola mutable y valida routing ambiguo al publicar.
- ProductionQueue es read model con revision, `asOf`, freshness y rebuild.
- Repriorización es command auditado, no PATCH de posiciones.
- Alertas deduplican y no son fuente del estado de Command.
- APIs aplican idempotencia, `If-Match`, scope de estación y degradación.
- Eventos usan outbox, deduplicación, compatibilidad y payload mínimo.
- Workflow exige precondiciones, historial inmutable y compensaciones.
- Tests contemplan concurrencia, reordenamiento, retry y aislamiento.

## Próxima revisión

Revisar después de resolver KIT-REV-001–003. La evidencia debe incluir máquina única, diagrama
Ticket→Command→Queue, schemas discriminados, fixtures de routing/priority y contract tests de
cancel/ready/reassign con eventos duplicados y KDS stale.

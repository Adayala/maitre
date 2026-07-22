# Revisión de contratos — Platform & Governance SPEC-207–226

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-207–226 |
| Commit revisado | `d4856eb` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Los contratos establecen buenas fronteras: React/Node/TypeScript portables, PostgreSQL y puertos
propios, free tier medido, WCAG 2.2 AA, schemas/OpenAPI, observabilidad portable, outbox,
offline/realtime reconciliable, seguridad, restore probado, CI/CD inmutable y gobernanza SDD.

Sin embargo, las veinte specs están `DRAFT/BLOCKED`, carecen de owner/reviewer y el grafo de
dependencias contiene ciclos que impiden una ruta I0. Además, el historial ya contiene commits
`feat` sobre specs sin `READY_FOR_IMPLEMENTATION`; esto es drift de gobernanza que debe
reconciliarse explícitamente, no ocultarse ni corregirse reescribiendo historia.

## Findings bloqueantes

### PLAT-REV-001 — Todas las specs transversales están bloqueadas

- Severidad: alta.
- Evidencia: SPEC-207–226 declaran `Estado: DRAFT`, `Readiness: BLOCKED`, owner/reviewer
  `UNASSIGNED`; SPEC-210–212/219–221/226 añaden gates/ADRs/spikes pendientes.
- Resolución: asignar responsables, ejecutar gates y registrar approvals contra commits exactos.

### PLAT-REV-002 — Grafo transversal contiene ciclos

- Severidad: alta.
- Evidencia mínima:
  - SPEC-210 depende de SPEC-214/220/226; SPEC-214 y 220 dependen de SPEC-210.
  - SPEC-211/212 dependen de SPEC-226; SPEC-226 depende de SPEC-207–225, incluidas 211/212.
- Riesgo: ninguna spec del ciclo puede satisfacer su criterio de entrada; tooling de DAG/ruta
  crítica no puede ordenarlas.
- Resolución: separar “spike requerido para decidir” de “verificación posterior”, orientar edges
  en una sola dirección y validar aciclicidad antes de cambiar readiness.

### PLAT-REV-003 — Implementación adelantada a gobernanza

- Severidad: alta.
- Evidencia: el historial contiene commits `feat` para SPEC-001–012, 017–020, 023 y 026 mientras
  SPEC-207/225 y las specs afectadas permanecen bloqueadas o sin aprobación registrada.
- Riesgo: no hay trazabilidad confiable entre spec revisada, decisión y código implementado.
- Resolución: inventariar cada `feat`, commit/spec/criterios/tests; realizar revisión retroactiva,
  registrar excepciones y findings. No marcar READY/VERIFIED automáticamente ni reescribir commits.

### PLAT-REV-004 — ADR-002/003/004 siguen PROPOSED

- Severidad: alta.
- Evidencia: datos/identidad, toolchain y UI dependen de ADRs propuestas y spikes I0; sólo ADR-001
  figura ACCEPTED.
- Riesgo: código puede cristalizar Supabase/tooling/UI antes de validar costo, límites y salida.
- Resolución: ejecutar SPEC-226, adjuntar evidencia PASS/FAIL/INCONCLUSIVE y aceptar/rechazar ADRs
  con consecuencias y rollback antes de nuevos compromisos de plataforma.

### PLAT-REV-005 — Recursos development y configuración compartida pendientes

- Severidad: alta.
- Evidencia: SPEC-226 declara blocker de proyectos Vercel/Supabase; la coordinación con Adrian
  para vincular Supabase, repo y Vercel continúa pendiente.
- Resolución: documentar project refs no secretas, owners, ambientes, quotas y quién inyecta cada
  variable; secretos sólo por canal seguro, nunca en Git/issues/docs.

## Findings medios

### PLAT-REV-006 — Quality gate necesita baseline sobre código existente

Ejecutar install/lint/typecheck/unit/integration/build/Sonar-equivalent/security/secret scan sobre
HEAD; registrar findings y debt baseline sin convertir errores nuevos en deuda aceptada. Definir
qué bloquea PR/main con herramientas totalmente gratuitas.

### PLAT-REV-007 — Free-tier budgets requieren números medidos

Provider register debe contener límites vigentes, consumo observable, thresholds y degradación.
Sin medición, “USD 0” es intención. Previews, DB compute/storage, egress, cron/realtime y CI
minutes deben tener budget/kill switch.

### PLAT-REV-008 — Restore/exit strategy aún no demostrados

Backups, exports y portabilidad no cuentan hasta restaurar PostgreSQL/Auth/config en un entorno
limpio y medir RPO/RTO. Separar datos regenerables de fiscales/audit/PII y probar eliminación.

### PLAT-REV-009 — Realtime/offline necesitan command matrix

Cada command funcional debe declarar soporte offline, idempotency, conflict policy, payload
retention y UX. Realtime distribuye proyecciones con cursor/fallback; no reemplaza HTTP ni
autorización server-side.

### PLAT-REV-010 — Gobernanza necesita resumen de findings accionable

Las revisiones de SPEC-001–226 ya identifican blockers repetidos. Crear registry de findings con
ID, severidad, owner, dependencia, estado y resolución, sin duplicar metadata autoritativa de
las specs.

## Evidencia positiva

- Vercel/Supabase son adapters candidatos, no dominio ni dependencia irreversible.
- Toolchain propuesto es open source y contratos se comparten desde schemas ejecutables.
- Secrets/configuración se validan por ambiente y no llegan al browser.
- HTTP define Problem Details, cursor, ETag, idempotencia y contexto autorizado.
- Telemetría usa allowlists/redacción y evita cardinalidad alta.
- Async asume at-least-once con outbox/deduplicación, no exactly-once ficticio.
- CI/CD promueve artefactos inmutables y requiere rollback/health/smoke.
- Tests usan datos sintéticos, reloj/timezone controlados y cubren accesibilidad/seguridad.
- SPEC-225 separa readiness de lifecycle y prohíbe aprobación automática.

## Próxima revisión

Resolver primero PLAT-REV-001–005. Luego validar DAG, ejecutar spikes/gates, aceptar ADRs y
producir auditoría retroactiva de los commits `feat`. Sólo entonces puede evaluarse el walking
skeleton para `READY_FOR_IMPLEMENTATION` o `VERIFIED` con evidencia reproducible.

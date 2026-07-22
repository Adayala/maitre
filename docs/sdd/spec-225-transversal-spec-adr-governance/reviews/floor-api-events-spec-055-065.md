# Revisión de contratos — Floor APIs & Events SPEC-055–065

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-055–065 |
| Commit revisado | `3e5fabd` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Las APIs usan comandos explícitos, idempotencia, optimistic concurrency y revalidación de
proyecciones. Los eventos minimizan PII y asumen outbox/consumidores idempotentes. RBAC separa
seating, caja y cocina con scope por sucursal.

La aprobación queda bloqueada por metadata enteramente provisoria y por contratos que dependen
de decisiones aún abiertas en Floor Core, especialmente lifecycle de Visit y ledger de pagos.

## Findings bloqueantes

### FLOOR-API-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-055–065 usan `Type: TBD`, `Priority: TBD`, fase pendiente y no asignan
  owner/reviewer ni dependencias autoritativas.
- Riesgo: el registro no puede validar tipo, prioridad, ruta crítica ni aprobación.
- Resolución: normalizar los once README mediante el contrato/baseline de SPEC-225 y asignar
  responsables antes de revisar readiness.

### FLOOR-API-REV-002 — Dependencia bloqueante de lifecycle y pagos

- Severidad: alta.
- Evidencia: comandos/eventos operan estados de Visit, Check y Payment que FLOOR-REV-002/003
  todavía consideran ambiguos.
- Riesgo: fijar endpoints/eventos ahora puede cristalizar transiciones o ecuaciones incorrectas.
- Resolución: resolver primero tablas de transición y ledger; luego derivar comandos, errores,
  events y matriz RBAC desde una única autoridad.

### FLOOR-API-REV-003 — PaymentProcessed no define cada hecho terminal

- Severidad: alta.
- Evidencia: “resultado final relevante” y `outcome` pueden representar capture, failure,
  void o refund sin event names/transiciones inequívocas; refund parcial agrava la ambigüedad.
- Riesgo: Cash, Fiscal y Analytics podrían contabilizar dos veces o interpretar failure como
  liquidación.
- Resolución: definir taxonomía de hechos, identidad lógica, revisión, montos original/delta y
  reglas de compatibilidad/replay por transición.

## Findings medios

### FLOOR-API-REV-004 — Matriz RBAC no decide quién cobra/corrige

SPEC-065 describe CASHIER como lector de Check/Payment, pero registrar Payment es una acción
separada sin matriz allow/deny completa. Definir permissions para initiate, record cash,
capture, refund, void y reconcile, incluyendo límites y segregación.

### FLOOR-API-REV-005 — Envelope/event identity no está uniforme

Los contratos listan payload pero no repiten o enlazan de forma normativa todos los campos del
envelope SPEC-217 (`eventId`, version, occurredAt, correlation/causation, aggregate revision).
Fijar referencia común y aclarar qué campos son payload para evitar schemas divergentes.

### FLOOR-API-REV-006 — Concurrencia de Occupancy depende de una proyección

SPEC-056 pide expected version de Table projection. Una proyección stale no debe ser el lock
autoritativo; la exclusión por mesa debe apoyarse en constraint/aggregate transaccional y usar
la revisión sólo como precondición UX.

### FLOOR-API-REV-007 — Cierre `422` o `CLOSING` queda a elección

SPEC-060 ofrece dos comportamientos según política aún no identificada. Elegir regla versionada,
respuesta/status y recovery para que clientes y tests no implementen ramas incompatibles.

## Evidencia positiva

- No hay PATCH arbitrario para transiciones de dominio.
- Idempotency-Key y `If-Match` cubren reintentos y lost updates.
- Move multi-table es atómico y no revela la visita en conflicto.
- TableStatus stale se comunica y no autoriza seating.
- Totales de Check se calculan server-side desde snapshots.
- Browser no confirma estados de provider ni envía PAN/CVV.
- Eventos evitan contacto, line items y credenciales innecesarias.
- RBAC contempla assignment, branch scope, self-escalation y no enumeración.

## Próxima revisión

Revisar luego de normalizar metadata y resolver FLOOR-REV-002/003. La evidencia debe incluir
OpenAPI/AsyncAPI o schemas equivalentes, tablas command→permission, constraints de occupancy,
taxonomía financiera y contract tests de eventos duplicados/desordenados.

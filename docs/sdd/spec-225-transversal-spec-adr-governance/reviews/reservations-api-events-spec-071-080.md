# Revisión de contratos — Reservations APIs & Events SPEC-071–080

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-071–080 |
| Commit revisado | `c3bbb13` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El bloque diferencia consultas de disponibilidad de reservas confirmadas, usa commands
idempotentes, minimiza PII y desacopla notificaciones mediante intención/outbox. Eventos
versionados no tratan create como confirm y RBAC separa acceso público de membership.

La aprobación queda bloqueada por metadata provisoria y porque cálculo/eventos no pueden ser la
autoridad transaccional que evita sobreventa o libera capacidad.

## Findings bloqueantes

### RES-API-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-071–080 mantienen type, phase y priority `TBD`, sin owner/reviewer ni
  dependencias autoritativas.
- Resolución: normalizar los diez README con SPEC-225, asignar responsables y registrar outcome.

### RES-API-REV-002 — Confirmación no define reserva transaccional de capacidad

- Severidad: alta.
- Evidencia: SPEC-071 promete revalidación atómica y SPEC-079 es un cálculo side-effect-free que
  afirma evitar double allocation, pero no existe constraint/hold/ledger autoritativo.
- Riesgo: dos comandos pueden calcular el mismo slot y confirmar ambos.
- Resolución: derivar el command de confirmación del modelo requerido por RES-CORE-REV-002,
  fijando lock/constraint, revisión de inputs, commit de reserva y outbox en una unidad atómica.

### RES-API-REV-003 — Cancelled no debe liberar sólo por proyección eventual

- Severidad: alta.
- Evidencia: SPEC-078 indica que un consumidor libera capacidad idempotentemente.
- Riesgo: hasta consumir el evento, availability puede negar capacidad liberada o, peor, otra
  fuente puede divergir ante DLQ.
- Resolución: la transacción de cancelación debe actualizar la autoridad de capacidad; el evento
  invalida/reconstruye proyecciones, pero no completa la invariant principal.

## Findings medios

### RES-API-REV-004 — Capability pública sin contrato de lifecycle

Definir token opaco con scope de acción/recurso, expiración, rotación, revocación, rate limit,
hash at rest y respuestas anti-enumeración. Un token de consulta no debe permitir cancelación o
revelar PII por reutilizar el mismo capability.

### RES-API-REV-005 — Consentimiento de notificación necesita clasificación

Confirmaciones/cancelaciones transaccionales y recordatorios/promoción pueden tener bases y
opt-outs distintos. Versionar purpose/template/channel y guardar evidencia mínima; un provider
outage no debe alterar Reservation.

### RES-API-REV-006 — Delete/export de Guest y referencias históricas

SPEC-072 debe distinguir acceso/export, rectificación, anonymization y retención legal/operativa.
No se puede borrar una identidad de forma que rompa Reservation, Audit o métricas; usar alias o
snapshot mínimo según matriz RES-CORE-REV-003.

### RES-API-REV-007 — Rol `host` no pertenece al catálogo canónico

SPEC-080 menciona host/rol designado mientras SPEC-018 no define `HOST`. Resolver como permission
assignment explícito o incorporar rol mediante cambio versionado; evitar strings locales.

### RES-API-REV-008 — Envelope y calendario requieren uniformidad

Eventos deben enlazar todos los campos comunes SPEC-217 y representar horarios como instantes +
timezone/business semantics inequívocos. `start/duration` sin formato normativo puede cambiar
al reserializar DST.

## Evidencia positiva

- Availability comunica `asOf` y no promete capacidad.
- Commands usan idempotencia, `If-Match`, reason codes y revalidación server-side.
- Seating de Reservation/Waitlist crea o vincula Visit una sola vez.
- Notificación crea intención y no llama al provider dentro del command.
- Dedupe/rate limit, opt-out y template missing tienen pruebas previstas.
- Eventos omiten contacto/texto libre y distinguen created/confirmed/cancelled.
- Cálculo recibe inputs versionados, `asOf`, timezone y explica indisponibilidad.
- PII requiere permiso separado y bulk export se deniega por defecto.

## Próxima revisión

Revisar luego de normalizar metadata y resolver RES-API-REV-002/003. La evidencia debe incluir
constraint/ledger de capacidad, capability threat model, schemas de calendario/eventos y tests
concurrentes de confirm/cancel/seat con mensajes duplicados o demorados.

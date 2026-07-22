# Revisión de contratos — Reservations Core SPEC-066–070

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-066–070 |
| Commit revisado | `ff332b2` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Reservation, Guest, Waitlist, Preference y CancellationPolicy están separados de User,
Visit y Payment. El diseño contempla timezone, concurrencia, idempotencia, consentimiento,
snapshots de política y ausencia de penalidades automáticas en I0.

La aprobación queda bloqueada por metadata sin resolver y porque el modelo no fija aún cómo
una reserva confirmada consume/libera capacidad ni cómo se gobiernan datos sensibles y
prioridades operativas.

## Findings bloqueantes

### RES-CORE-REV-001 — Owner/reviewer/prioridad sin resolver

- Severidad: alta.
- Afecta: SPEC-066–070.
- Evidencia: owner/reviewer/prioridad `UNASSIGNED` y blocker explícito.
- Resolución: asignar responsables/prioridad y registrar outcome contra commit exacto.

### RES-CORE-REV-002 — Consumo de capacidad no tiene autoridad definida

- Severidad: alta.
- Evidencia: disponibilidad se revalida al confirmar, pero no se define si CONFIRMED reserva
  mesas concretas, un pool por franja o una cuota; tampoco expiración/release ni constraint.
- Riesgo: dos confirmaciones concurrentes pueden sobre-vender aun cuando ambas consultas previas
  indiquen disponibilidad.
- Resolución: definir modelo de inventory/capacity, unidad de lock, transacción, hold/release,
  reasignación y relación con Occupancy/TableStatus y SPEC-079.

### RES-CORE-REV-003 — Datos sensibles/consentimiento sin lifecycle verificable

- Severidad: alta.
- Evidencia: Guest/Preference pueden contener contacto, accesibilidad y notas dietarias, pero
  faltan purpose, proof/version del consentimiento, acceso por rol, retención y redacción por
  campo.
- Riesgo: se puede conservar o mostrar información sensible fuera del propósito declarado.
- Resolución: crear matriz campo→propósito→base/consent→roles→retención→export/delete y separar
  requirements operativos de preferencias informativas.

## Findings medios

### RES-CORE-REV-004 — Lifecycle de Reservation necesita tabla completa

Faltan transiciones como expiración de PENDING, reversibilidad de NO_SHOW, cancelación tras
seating y significado de COMPLETED frente al cierre de Visit. Definir comandos, actor, motivo,
precondiciones y eventos por arista.

### RES-CORE-REV-005 — Prioridad de Waitlist requiere política auditable

`priority reason` altera orden, pero no define catálogo, permisos, límites ni explicación al
operador. Evitar texto libre como autoridad y cubrir fairness, override y abuso sin inferir
atributos sensibles.

### RES-CORE-REV-006 — Merge/unmerge de Guest necesita identidad lógica

Definir canonicalId, aliases, referencias históricas, concurrencia, autorización y qué ocurre
cuando contactos/consentimientos difieren. Unmerge no debe restaurar datos ya eliminados por
retención o revocación de consentimiento.

### RES-CORE-REV-007 — Override de CancellationPolicy sin RBAC

La evaluación admite override autorizado, pero no identifica permission, motivo, límites ni
auditoría. Enlazar SPEC-080 y distinguir excepción operativa de mutación retroactiva de policy.

## Evidencia positiva

- Guest no se confunde con User autenticado ni se deduplica sólo por nombre.
- Seating de Reservation/Waitlist enlaza una única Visit idempotentemente.
- Notificar waitlist no promete ni reserva capacidad.
- Preferencias se declaran como señales y texto libre se limita/sanitiza.
- CancellationPolicy se versiona y Reservation captura su revisión.
- Evaluaciones reciben `asOf` y timezone, evitando reloj global y errores DST.
- I0 no genera cargos automáticos por cancelación.
- Cross-tenant, concurrencia, redacción y export/delete están contemplados en pruebas.

## Próxima revisión

Revisar después de resolver RES-CORE-REV-001–003. La evidencia debe incluir máquina de estados,
modelo transaccional de capacidad, matriz de privacidad, fixtures DST y casos concurrentes de
confirmación, seating, cancelación y no-show.

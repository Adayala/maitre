# Revisión de contratos — Cash Management SPEC-124–136

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-124–136 |
| Commit revisado | `9c4ec86` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Movements son append-only y se corrigen por compensación; reconciliación congela inputs y
separa aprobación; importes se recalculan desde ledger; descuentos son versionados; settlement
es reproducible por business date/timezone. El bloque contempla idempotencia, auditoría y
segregación.

La aprobación queda bloqueada por metadata provisoria y porque todos los contratos dependen de
una “sesión de caja” que no tiene identidad/lifecycle de entidad explícitos.

## Findings bloqueantes

### CASH-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-124–136 mantienen type, phase y priority `TBD`, sin owner/reviewer ni
  dependencias autoritativas.
- Resolución: normalizar trece README con SPEC-225 y asignar responsables.

### CASH-REV-002 — CashSession no tiene contrato autoritativo

- Severidad: alta.
- Evidencia: CashRegister dice admitir una sesión abierta; Movement, Reconciliation, APIs y
  eventos referencian `sessionId`, pero no existe entidad con inicio/fin, responsables, moneda,
  saldos, estado, versión y relaciones.
- Riesgo: estado del dispositivo/configuración y lifecycle de cada apertura se mezclan; no se
  pueden garantizar unicidad, historia ni conciliación.
- Resolución: modelar CashSession explícita o incorporarla inequívocamente como child entity del
  agregado, con identidad, constraints, transitions y snapshots.

### CASH-REV-003 — Ledger esperado no define fuentes ni ecuaciones

- Severidad: alta.
- Evidencia: reconciliación recalcula desde “el ledger”, pero no fija autoridad/mapping de cash
  payments, refunds, tips, deposits, compensations y movimientos manuales.
- Riesgo: Check/Payment, CashMovement y settlement pueden contabilizar dos veces o ignorar dinero.
- Resolución: definir journal entries, claves idempotentes, signs, currency, source references y
  ecuaciones por medio de pago, alineadas con Floor Payments y conectores.

## Findings medios

### CASH-REV-004 — Close/reconciliation ante pagos tardíos

Definir cutoff, estados provisional/final, late adjustment, reapertura y nuevo evento. Una
reconciliación aprobada no debe mutarse silenciosamente cuando llega un webhook tardío.

### CASH-REV-005 — Discount ownership y aplicación necesitan frontera

Discount está en Cash pero impacta Order/Check/Catalog. Elegir autoridad de reglas/aplicaciones,
snapshot en Check, stacking determinista y comando de override; Cashier no debe editar políticas
para alterar su propia conciliación.

### CASH-REV-006 — `CashRegistered` nombra un hecho ambiguo

El evento representa un CashMovement aceptado, no el alta de CashRegister. Renombrar/versionar
como `CashMovementRecorded` o documentar terminología inequívoca antes de consumidores.

### CASH-REV-007 — Detección de compliance requiere revisión humana

Fraccionamiento/diferencias pueden ser señales, no fraude probado. Findings deben comunicar
evidencia/confianza, restringir acceso y prohibir sanción automática; políticas necesitan owner,
vigencia y provenance.

### CASH-REV-008 — Roles no canónicos y límites sin autoridad

`supervisor`/`finance` deben mapear a permisos versionados. Definir limits policy, step-up,
segregación, override y fallback seguro cuando la política no está configurada.

## Evidencia positiva

- Movements son inmutables y las correcciones son compensatorias.
- Amount positivo + tipo evita signos implícitos en input.
- Create/commands usan idempotencia y concurrencia optimista.
- Reconciliation no acepta el total esperado del cliente.
- Aprobación/rechazo conservan actor, motivo, evidencia y versión.
- Discounts usan vigencia, prioridad, stacking, topes y snapshots.
- Settlement usa decimales, timezone, ledger revision y fixtures dorados.
- Compliance no elimina registros y detecta autoaprobación/fraccionamiento.

## Próxima revisión

Revisar después de resolver CASH-REV-001–003. La evidencia debe incluir CashSession, journal
model, ecuaciones, casos de webhook tardío, matriz de segregación y reconciliación dorada entre
Payment, Movement y DailySettlement.

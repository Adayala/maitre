# Revisión de contratos — Floor Core SPEC-049–054

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-049–054 |
| Commit revisado | `9514ee9` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Visit/Occupancy/TableStatus separan agregado, intervalos y proyección; Check se distingue de
factura fiscal; Payment evita datos de tarjeta; Service usa business date de la sucursal. Los
contratos cubren concurrencia, idempotencia, precisión monetaria y aislamiento.

La aprobación queda bloqueada por ownership/prioridad sin resolver y por semánticas aún
ambiguas en lifecycle de Visit, reservas en TableStatus, pagos parciales y cierre de Service.

## Findings bloqueantes

### FLOOR-REV-001 — Owner/reviewer/prioridad sin resolver

- Severidad: alta.
- Afecta: SPEC-049–054.
- Evidencia: owner/reviewer `UNASSIGNED`, prioridad `UNASSIGNED` y blocker explícito.
- Resolución: asignar responsables/prioridad y registrar outcome contra commit exacto.

### FLOOR-REV-002 — Lifecycle de Visit insuficiente para consumidores

- Severidad: alta.
- Evidencia: Visit sólo define `OPEN | PAYING | CLOSED`, mientras Ordering, Reservations,
  TableStatus y operación necesitan distinguir waiting/seated/service/check requested o una
  fuente equivalente.
- Riesgo: cada consumidor podría inferir etapas distintas o sobrecargar flags/eventos.
- Resolución: decidir si Visit mantiene una máquina más rica o si las etapas son proyecciones
  explícitas; fijar transiciones, precondiciones y eventos sin duplicar autoridad.

### FLOOR-REV-003 — Pago parcial/refund no modelado completamente

- Severidad: alta.
- Evidencia: Check menciona split como futuro; Payment admite amount y `REFUNDED`, pero no
  define múltiples pagos, captura parcial, refund parcial, propina ni saldo con precisión.
- Riesgo: reintentos/callbacks pueden liquidar incorrectamente una cuenta.
- Resolución: definir ledger/transiciones y ecuaciones mínimas del MVP, aunque split UI quede
  fuera de alcance; alinear con SPEC-059, SPEC-182 y Cash.

## Findings medios

### FLOOR-REV-004 — `RESERVED` necesita ventana y precedencia temporal

TableStatus no define cuándo una reserva futura bloquea la mesa, cómo compiten varias reservas
ni qué ocurre ante no-show o retraso. Enlazar SPEC-074/079 y producir reason, effective window,
revision y `asOf` deterministas.

### FLOOR-REV-005 — Política de solapamiento/cierre de Service pendiente

“Los definidos por política” no identifica configuración autoritativa. Definir clave de
unicidad, tipos de servicio, transición CLOSING, timeout/escalamiento y tratamiento de Visits,
Checks o Payments todavía abiertos.

### FLOOR-REV-006 — Service colisiona semánticamente con Subscription

Aunque el contrato aclara la diferencia, `Service`/`serviceCode` aparece en dos dominios. Usar
nombres de módulo/namespace inequívocos en schemas, eventos y APIs para evitar imports y métricas
ambiguas.

### FLOOR-REV-007 — Check y Fiscal requieren frontera verificable

Impuestos “estimados” de Check deben reconciliar con cálculo fiscal sin convertir Invoice en
dependencia para operar. Fijar autoridad por etapa, snapshots, diferencias permitidas y
corrección cuando ARCA rechaza o redondea distinto.

## Evidencia positiva

- Occupancy es la autoridad temporal y evita flags mutables en Table.
- Move/cierre preservan historia y se realizan atómicamente.
- TableStatus comunica revision/`asOf` y revalida antes de mutar.
- Check no se confunde con Invoice y usa snapshots/decimales.
- Payment no almacena PAN, CVV ni credenciales y deduplica callbacks.
- Service deriva business date desde timezone IANA y contempla DST.
- Cierres terminales, auditoría y cross-tenant tienen pruebas previstas.

## Próxima revisión

Revisar luego de resolver FLOOR-REV-001–003 y documentar ventana de reserva, política de cierre
y frontera fiscal. La evidencia debe incluir tablas de transición, ecuaciones de saldo y casos
concurrentes de seating, pago, cierre y eventos desordenados.

# Revisión de contratos — Ordering Core SPEC-081–086

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-081–086 |
| Commit revisado | `e52f5ea` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

Order captura snapshots comerciales, separa total operativo de autoridad fiscal y conserva
items/modifiers después de submit. QRMenu y DigitalBill usan capabilities opacas; KitchenTicket
minimiza PII/precios y deduplica la producción por revisión/estación.

La aprobación queda bloqueada por metadata sin ownership/prioridad y por autoridad ambigua entre
estado de Order, estados de items y KitchenTicket.

## Findings bloqueantes

### ORD-CORE-REV-001 — Owner/reviewer/prioridad sin resolver

- Severidad: alta.
- Afecta: SPEC-081–086.
- Resolución: asignar responsables/prioridad y registrar outcome contra commit exacto.

### ORD-CORE-REV-002 — Estado agregado de Order sin regla de derivación

- Severidad: alta.
- Evidencia: Order posee `ACCEPTED | IN_PREP | READY | DELIVERED`; OrderItem tiene estado
  independiente y KitchenTicket deriva estado de items.
- Riesgo: tres autoridades pueden divergir ante preparación parcial, cancelación o entrega.
- Resolución: fijar qué estados son commands y cuáles proyecciones, precedencia/agregación por
  item, transiciones parciales y fuente de timestamps; publicar eventos desde hechos autoritativos.

### ORD-CORE-REV-003 — KitchenTicket mezcla proyección y command model

- Severidad: alta.
- Evidencia: se define como “proyección/comando de producción”.
- Riesgo: una proyección eventualmente consistente no puede proteger transiciones ni ownership
  de producción; un agregado mutable no debería reconstruirse como simple vista sin reglas.
- Resolución: separar agregado/queue item autoritativo de read model KDS y documentar mapping,
  idempotencia, replay y comandos permitidos.

## Findings medios

### ORD-CORE-REV-004 — Revalidación de catálogo al submit incompleta

Modifier se valida al capturar, pero un draft puede sobrevivir a cambios de precio,
disponibilidad, impuestos o reglas. Definir catalog revision, política de price change,
revalidación y respuesta explicable antes de congelar el snapshot.

### ORD-CORE-REV-005 — Cancelación parcial necesita ledger de ajustes

Order admite cancel parcial y OrderItem se cancela, pero faltan ecuaciones, cantidades parciales,
impacto sobre Check/Payment/Kitchen y compensaciones cuando la preparación ya comenzó.

### ORD-CORE-REV-006 — DigitalBill: snapshot versus proyección mutable

El contrato habla de snapshot de líneas/totales y también de actualizaciones por revisión.
Elegir una proyección versionada del Check con `asOf` o un documento inmutable por emisión;
definir saldo/pagos redactados, cache y estado settled/void.

### ORD-CORE-REV-007 — Capabilities deben almacenarse de forma segura

QRMenu/DigitalBill cubren entropía, rotación y expiración, pero deben fijar hash at rest, scope,
revocación, rate limit, cache key y separación: un token de menú jamás se reutiliza para orden
o cuenta.

### ORD-CORE-REV-008 — Snapshot de impuestos depende de decisiones fiscales

Product/OrderItem deben compartir convención neto/final, tax rate version y redondeo con Catalog,
Check y Fiscal. No duplicar fórmulas ni tratar el total de Order como factura.

## Evidencia positiva

- Tenant/branch/visit son inmutables y submit es idempotente.
- Items/modifiers conservan snapshot y no cambian con el catálogo posterior.
- Money es exacto, quantity positiva y notas libres se sanitizan.
- QR no concede capacidad de ordenar/pagar y evita IDs predecibles.
- DigitalBill no reemplaza Invoice ni expone guest/payment details.
- KitchenTicket no copia precios ni PII y contempla eventos duplicados/desordenados.
- No se elimina historia tras submit; cambios usan comandos/ajustes auditados.

## Próxima revisión

Revisar después de resolver ORD-CORE-REV-001–003. La evidencia debe incluir máquinas de estado
por agregado/item, revalidación de catálogo, ledger de ajustes y contract tests de split por
estación, cancelación parcial, capability abuse y eventos fuera de orden.

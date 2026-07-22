# Revisión de contratos — Ordering APIs & Events SPEC-087–097

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-087–097 |
| Commit revisado | `34654f0` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El bloque usa comandos explícitos, importes server-side, idempotencia y proyecciones con
freshness. Los accesos públicos son capabilities revocables; recomendaciones son explicables y
degradables; solicitudes especiales requieren confirmación operativa; eventos omiten PII.

La aprobación queda bloqueada por metadata provisoria y por contratos externos que dependen de
la autoridad de estados/ajustes aún no resuelta en Ordering Core.

## Findings bloqueantes

### ORD-API-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-087–097 mantienen type, phase y priority `TBD`, sin owner/reviewer ni
  dependencias autoritativas.
- Resolución: normalizar once README con SPEC-225 y asignar responsables.

### ORD-API-REV-002 — Commands/eventos dependen de estados ambiguos

- Severidad: alta.
- Evidencia: submit/cancel/modify y OrderReady/Delivered dependen de las autoridades todavía
  abiertas en ORD-CORE-REV-002/003.
- Riesgo: API, KDS y eventos pueden aceptar transiciones distintas para el mismo item/order.
- Resolución: cerrar máquinas de estado y mapping de producción antes de estabilizar schemas,
  errors y permisos.

### ORD-API-REV-003 — `OrderPlaced` no coincide con el hecho descrito

- Severidad: alta.
- Evidencia: el evento se llama Placed pero se publica “al aceptar” una orden; submit y accept
  son estados distintos en SPEC-081.
- Riesgo: consumidores crean producción al submit o esperan accept de forma incompatible.
- Resolución: elegir hecho exacto (`OrderSubmitted`/`OrderAccepted`) y definir productor,
  precondición, revisión e idempotencia; renombrar/versionar antes de consumidores.

## Findings medios

### ORD-API-REV-004 — Modificaciones requieren consistencia con Kitchen y Check

Registrar delta no define atomicidad o compensación entre Order, producción y cuenta. Fijar
secuencia/saga, estados pending/applied/rejected y conducta ante cocina offline, item preparado
o pago ya iniciado.

### ORD-API-REV-005 — Eventos de orden completa no cubren parciales

Ready/Delivered se emiten para orden completa, pero contratos aceptan preparación/entrega
parcial. Definir eventos por item/batch o una proyección con revisiones que permita converger sin
inventar que todo está listo.

### ORD-API-REV-006 — Capabilities públicos necesitan scopes separados

QR Menu, DigitalBill y Tracking deben usar tokens distintos o scopes explícitos, con hash at
rest, expiración, rotación, revocación, rate limit y cache keys. Ninguno concede create/order,
payment ni acceso a otra Visit.

### ORD-API-REV-007 — Recomendaciones y restricciones pueden ser sensibles

Aunque no se infieren diagnósticos, restricciones explícitas pueden revelar salud/religión.
Definir procesamiento efímero por defecto, consentimiento/purpose, no-retención, logs redactados
y ausencia de perfilado cross-visit.

### ORD-API-REV-008 — Roles `customer` y `kitchen` no son códigos canónicos

SPEC-097 debe mapear a `GUEST`, `COOK` u otros permission assignments versionados, no crear
strings locales. Además, ownership de waiter/turno requiere fuente autoritativa y fallback.

## Evidencia positiva

- El servidor calcula precios y rechaza importes del cliente.
- Create/submit y modificaciones cubren idempotencia/concurrencia.
- DigitalBill/Tracking declaran freshness y consistencia eventual.
- Recomendaciones incluyen motivo y fallback determinista.
- Solicitudes especiales no sustituyen alérgenos y requieren aceptación explícita.
- Eventos usan outbox, identidad, correlación, compatibilidad y payload mínimo.
- Delivered no cierra automáticamente Check.
- RBAC separa create, submit, modify, cancel y estados sensibles.

## Próxima revisión

Revisar luego de normalizar metadata, resolver ORD-CORE-REV-002/003 y renombrar/fijar el evento
de aceptación. La evidencia debe incluir saga de modificación, eventos parciales, threat model
de capabilities y matrices command→permission→actor.

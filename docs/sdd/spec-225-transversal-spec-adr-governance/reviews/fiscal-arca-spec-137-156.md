# Revisión de contratos — Fiscal & ARCA SPEC-137–156

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-137–156 |
| Commit revisado | `7e253ca` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El adapter ARCA queda server-side y portable, separa homologación/producción, protege
certificados, reconcilia timeouts ambiguos y no afirma que exportar Libro IVA equivalga a
presentarlo. Invoice/line items son snapshots; taxes/numeración usan cálculo determinista;
correcciones autorizadas se modelan como notas.

La aprobación productiva permanece correctamente bloqueada. Además de metadata incompleta,
hay una contradicción de lifecycle de Invoice y falta una autoridad explícita para puntos de
venta/numeración fiscal.

## Findings bloqueantes

### FISC-REV-001 — Metadata provisoria y revisión experta pendientes

- Severidad: alta.
- Evidencia: SPEC-137–144 y 146–156 mantienen metadata `TBD`; SPEC-145 carece de owner/reviewer
  y exige revisión fiscal competente, credenciales y runbook.
- Resolución: normalizar metadata, asignar owner técnico + reviewer fiscal y conservar producción
  bloqueada hasta homologación/evidencia oficial vigente.

### FISC-REV-002 — `CANCELLED` contradice inmutabilidad fiscal

- Severidad: alta.
- Evidencia: SPEC-137 incluye estado `CANCELLED`, pero el mismo contrato y SPEC-145 indican que
  un comprobante autorizado se corrige mediante nota de crédito/débito, no mutación.
- Riesgo: una implementación podría “cancelar” localmente un comprobante que sigue autorizado.
- Resolución: separar cancelación de draft/intención, rechazo y comprobante autorizado; eliminar
  o acotar `CANCELLED`, fijar máquina de estados y relaciones de notas.

### FISC-REV-003 — Punto de venta fiscal sin contrato autoritativo

- Severidad: alta.
- Evidencia: Invoice, ARCA y numbering dependen de fiscalEntity + pointOfSale + voucherType, pero
  no hay entidad/puerto con código, ambiente, habilitación, tipos admitidos y lifecycle.
- Riesgo: numeración puede mezclarse entre ambientes/tipos o aceptar un punto no habilitado.
- Resolución: definir FiscalPointOfSale, ownership, uniqueness, environment, capabilities,
  effective dates y vínculo con último autorizado.

### FISC-REV-004 — Fuente normativa/versionado oficial no gobernados

- Severidad: alta.
- Evidencia: TaxRate, QR, templates, export layouts y compliance usan códigos/reglas oficiales,
  pero falta provenance, fecha de consulta, aprobación, supersession y alerta de cambio.
- Resolución: registrar fuentes oficiales/versiones, reviewer competente, fixtures y proceso de
  actualización; fallar seguro si una versión requerida no está soportada.

## Findings medios

### FISC-REV-005 — InvoiceEmitted y ARCAConfirmed pueden duplicar el mismo hecho

Definir si ARCAConfirmed es técnico y InvoiceEmitted es dominio derivado, con causation/revision
únicas, o consolidarlos. Consumidores fiscales/contables no deben contabilizar ambos como dos
emisiones.

### FISC-REV-006 — `InvoiceGenerated` tiene nombre/semántica ambiguos

Representa un draft validado listo para emisión, no un comprobante generado/autorizado. Elegir
`InvoiceValidated`/`InvoiceReadyForIssue` o documentar versión inequívoca antes de consumidores.

### FISC-REV-007 — Certificados requieren arquitectura viable en free tier

Definir secret manager inicial, cifrado, límites, acceso runtime, backup/rotation y migración sin
guardar clave en DB/Git. Preview debe probar con credenciales de homologación separadas y nunca
heredar producción.

### FISC-REV-008 — TaxRate no debe ser CRUD tenant arbitrario

SPEC-149 permite crear/versionar alícuotas. Separar catálogo normativo administrado de mappings
tenant/product; cambios oficiales requieren aprobación y usuarios comunes no inventan códigos
que luego se presenten como válidos.

### FISC-REV-009 — Reconciliación Check→Invoice→Libro IVA necesita ecuaciones

Definir autoridad, rounding, discounts, tips, refunds/notas, currency y diferencias permitidas.
El export debe reconciliar comprobantes autorizados y excluir/reporter pending/rejected sin
fabricar una presentación exitosa.

### FISC-REV-010 — FiscalPrinter debe quedar fuera del camino crítico si no aplica

Impresora fiscal es capability/provider opcional. No debe bloquear WSFE/QR ni introducir SDK o
estado de hardware al dominio central; registrar alcance MVP y fallback de representación.

## Evidencia positiva

- Timeout ambiguo produce `PENDING_RECONCILIATION`, no un nuevo número a ciegas.
- Idempotencia lógica incluye entidad, punto, tipo e invoice interno.
- Secrets, tickets y payload SOAP sensible no llegan a browser/logs/artifacts.
- QR se deriva server-side de comprobante autorizado y usa fixtures oficiales.
- Templates separan branding de contenido fiscal obligatorio y sanitizan variables.
- Export IVA produce manifest, conteos, hash y no afirma presentación.
- Tax calculation usa decimales, ecuaciones, residuos y fixtures dorados.
- Producción permanece bloqueada hasta homologación, runbook y revisión competente.

## Próxima revisión

Revisar después de resolver FISC-REV-001–004. La evidencia debe incluir state machine de
Invoice, FiscalPointOfSale, registro de fuentes normativas, homologación de timeout/numeración,
rotación de certificado y reconciliación dorada Check→Invoice→Libro IVA.

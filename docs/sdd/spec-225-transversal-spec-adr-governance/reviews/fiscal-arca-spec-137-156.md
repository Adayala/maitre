# Revisión de contratos — Fiscal & ARCA SPEC-137–156

| Campo                      | Valor                                 |
| -------------------------- | ------------------------------------- |
| Alcance                    | SPEC-137–156                          |
| Commit revisado            | `0968f253`                            |
| Protocolo                  | `contract-review-checklist.md`        |
| Outcome                    | `I0 IMPLEMENTED / PRODUCTION BLOCKED` |
| Autoridad para implementar | Walking skeleton I0 implementado      |

## Resultado ejecutivo

El adapter ARCA queda server-side y portable, separa homologación/producción, protege
certificados, reconcilia timeouts ambiguos y no afirma que exportar Libro IVA equivalga a
presentarlo. Invoice/line items son snapshots; taxes/numeración usan cálculo determinista;
correcciones autorizadas se modelan como notas.

La aprobación productiva permanece correctamente bloqueada hasta completar homologación y
revisión fiscal competente. El walking skeleton I0 ya resuelve lifecycle, autoridad de puntos de
venta, numeración, QR, persistencia y operación web; los alcances posteriores se registran
separadamente y no bloquean el cierre del umbrella de implementación I0.

## Estado reconciliado del I0

- Invoice y líneas preservan snapshot e inmutabilidad; las correcciones autorizadas son notas.
- FiscalPointOfSale es autoritativo por entidad, sucursal, ambiente, código y tipos admitidos.
- WSAA/WSFEv1 separa homologación y producción, reconcilia resultados ambiguos y no expone
  certificados ni claves privadas al browser.
- Dash administra titular fiscal, sucursales y puntos de venta, con cobertura E2E del CRUD
  registral y declaración en homologación.
- El preview de templates usa fixtures sintéticos por contrato; no pretende ser comprobante.
- SPEC-150 entrega el manifest I0 de comprobantes autorizados. El job/archivo descargable y
  Libro IVA Digital quedan fuera de esta iteración.
- SPEC-156 permanece explícitamente como placeholder fuera de P0 para I0.

## Alcance posterior, no bloqueante para I0

- [Issue #42](https://github.com/Adayala/maitre/issues/42): driver/SDK, cola y contingencia
  operacional de impresora fiscal física;
- [Issue #43](https://github.com/Adayala/maitre/issues/43): renderer, distribución PDF/email y
  artefactos descargables de exportación;
- [Issue #44](https://github.com/Adayala/maitre/issues/44): rotación de certificados con
  overlap/rollback y habilitación productiva con evidencia formal de homologación;
- [Issue #45](https://github.com/Adayala/maitre/issues/45): motor normativo de compliance de
  SPEC-156;
- [Issue #46](https://github.com/Adayala/maitre/issues/46): protocolo y contingencia fiscal
  offline fail-closed;
- [Issue #34](https://github.com/Adayala/maitre/issues/34): Libro IVA Digital;

## Findings de la revisión histórica

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

La revisión para producción debe verificar el registro de fuentes normativas, la matriz de
homologación, rotación de certificados y reconciliación dorada Check→Invoice→Libro IVA. Esa
revisión no convierte el placeholder de SPEC-156 ni Libro IVA Digital en alcance implícito del I0.

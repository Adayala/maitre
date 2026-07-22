# Revisión de contratos — Subscription SPEC-027–036

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-027–036 |
| Commit revisado | `5b76a63` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El bloque separa correctamente intención comercial, items, derechos derivados y cuotas. El
MVP gratuito no ejecuta cobros, los entitlements no admiten CRUD y el cálculo recibe `asOf`,
expone sources/revisión y falla cerrado. APIs y eventos conservan aislamiento e idempotencia.

La aprobación queda bloqueada por gobernanza y porque el catálogo autoritativo de servicios,
tipos y reglas de agregación no tiene ownership/contrato explícito dentro del bloque.

## Findings bloqueantes

### SUB-REV-001 — Owner/reviewer sin resolver

- Severidad: alta.
- Afecta: SPEC-027–036.
- Evidencia: metadata `UNASSIGNED`.
- Resolución: asignar responsables y registrar revisión contra commit exacto.

### SUB-REV-002 — Catálogo de servicios no identificado como autoridad

- Severidad: alta.
- Evidencia: SPEC-028/035 dependen de service codes, schemas, tipos y reglas de agregación
  versionadas, pero no identifican una spec/puerto/artefacto autoritativo ni su lifecycle.
- Riesgo: API, cálculo, seeds y consumidores pueden duplicar o interpretar distinto
  `FLOOR.ACCESS`, límites, scopes y configuración.
- Resolución: definir contrato del catálogo, ownership, versionado, compatibilidad y fallback;
  enlazarlo desde metadata sin convertir configuración del proveedor en dominio.

### SUB-REV-003 — Rol de plataforma sin boundary operativo

- Severidad: alta.
- Evidencia: SPEC-031/036 reservan provisión, suspensión y cancelación a un rol de plataforma,
  pero no definen identidad, permisos, entorno, step-up ni audit trail de impersonation.
- Riesgo: un rol tenant podría escalar o una operación administrativa quedar sin atribución.
- Resolución: definir permission codes y flujo administrativo separado, con deny-by-default,
  segregación, actor real, motivo y tests negativos.

## Findings medios

### SUB-REV-004 — Dependencias no serializadas

Los README no declaran uniformemente dependencias hacia Organization, Identity, SPEC-208,
SPEC-215, SPEC-217 y el catálogo de servicios. Normalizar metadata para validar ciclos y ruta
crítica antes de promover readiness.

### SUB-REV-005 — Política de suspensión/cancelación requiere tabla normativa

SPEC-027 aclara que status no revoca por sí solo y SPEC-035 delega el resultado a política
explícita, pero falta una tabla por transición que indique nuevos writes, reads, exportación,
operaciones en curso y período de gracia. Sin ella, dos consumidores pueden fallar de manera
distinta. Definirla como input versionado del cálculo.

### SUB-REV-006 — Reducción de cuota bajo consumo no define remediation

La detección está cubierta, pero falta decidir si la reducción se rechaza, queda pending o
bloquea sólo nuevas altas. El contrato debe preservar recursos existentes, explicar estado y
evitar borrado automático.

## Evidencia positiva

- Subscription no es factura, credencial ni integración de pago.
- Entitlement/Quota son proyecciones derivadas sin endpoints de escritura.
- Ausencia de quota no equivale a ilimitado; unlimited es valor tipado.
- Mutaciones revalidan consumo atómicamente para evitar overbooking.
- Cálculo determinista recibe reloj y no suma cantidades implícitamente.
- Eventos informan hechos y no conceden autorización.
- API separa lectura tenant de provisión plataforma e incluye idempotencia/concurrencia.
- Reducción, expiración, cache stale, duplicados y cross-tenant tienen criterios de prueba.

## Próxima revisión

Revisar después de resolver SUB-REV-001–003 y documentar catálogo, matriz de lifecycle y
remediation de cuotas. La evidencia debe incluir fixtures dorados del cálculo, matrices
rol→acción y convergencia ante eventos activated/deactivated desordenados.

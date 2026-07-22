# Especificaciones faltantes — relevamiento y cierre normativo

**Alcance:** SPEC-001–226
**Fecha de corte:** 2026-07-22
**Naturaleza:** especificación; este documento no autoriza ni describe implementación realizada.

## 1. Resultado del relevamiento

La revisión documental de SPEC-225 cubre las 226 specs y mantiene los 19 bloques en
`BLOCKED`. Se detectaron dos clases de pendientes:

1. **Vacíos de contrato:** autoridad de datos, lifecycle, invariantes, concurrencia, seguridad,
   privacidad y semántica de eventos. Este documento fija las decisiones normativas mínimas.
2. **Evidencia o decisión externa:** owner/reviewer nominal, aprobación legal o fiscal, aceptación
   de ADR, ejecución de spikes, credenciales, costos y mediciones. Estos puntos permanecen
   bloqueados; no se completan con valores ficticios.

Los README placeholder con metadata `TBD` continúan en `DRAFT/BLOCKED` hasta migración individual.
Este documento no los promueve a `READY_FOR_IMPLEMENTATION`.

## 2. Reglas transversales obligatorias

Estas reglas aplican a toda spec funcional, API, evento, cálculo o integración:

- Toda escritura operacional pertenece a un `tenantId`; los recursos de sucursal agregan
  `branchId`. Ambos se obtienen del contexto autenticado y no se confían al body.
- Un recurso cross-tenant se responde como inexistente (`404`), salvo una operación interna de
  plataforma expresamente autorizada y auditada.
- Dinero se representa como entero en unidad menor + moneda ISO 4217. Un cálculo no mezcla
  monedas. Redondeo, impuestos y descuentos quedan congelados en snapshots contables/fiscales.
- Fechas de negocio incluyen instante UTC, zona IANA y fecha local derivada cuando el corte diario
  sea relevante. No se persisten horarios ambiguos.
- Toda mutación reintentable usa idempotency key con scope tenant + operación + actor/capability.
  La misma key y distinto payload devuelve conflicto.
- Toda actualización concurrente usa versión/ETag. Versión obsoleta devuelve `412`; transición
  inválida, `422`; conflicto de exclusión o idempotencia, `409`.
- Los eventos usan el envelope de SPEC-217, tienen identidad estable, versión de schema, causation
  y correlation. Outbox y escritura de dominio son atómicas. Consumidores deduplican por event ID.
- Los eventos expresan hechos consumados, no intenciones, y no contienen secretos ni PII no
  indispensable. Cambiar significado exige nueva versión o nuevo nombre.
- Roles son códigos canónicos de SPEC-018/019; nombres como `host`, `customer`, `kitchen` o
  `platform_admin` sólo son aliases de UX hasta que exista un mapping aprobado. La autorización
  se expresa mediante permisos/capabilities, no comparando etiquetas.
- Los tokens públicos son opacos, aleatorios, de propósito único, almacenados como hash, con
  expiración, revocación, rate limit y rotación. Nunca confieren acceso general al tenant.
- Operaciones sensibles producen auditoría append-only. Una falla de auditoría bloquea cambios
  financieros, fiscales, de permisos, secretos y soporte cross-tenant; para telemetría no crítica
  puede degradar con alerta y reconciliación posterior.
- PII posee purpose, base/consentimiento cuando corresponda, retención, acceso, exportación y
  borrado o anonimización. Registros contables/fiscales conservan el snapshot legal y desvinculan
  la identidad operativa cuando el borrado sea obligatorio.
- Ninguna proyección eventual es autoridad para reservar capacidad, cobrar, cerrar caja, numerar
  comprobantes o confirmar una transición irreversible.

## 3. Organization e Identity — SPEC-001–026

- La dependencia se orienta `User -> Membership -> Tenant`; crear un User no requiere Membership.
  Membership vincula una identidad ya creada con tenant, rol y scope opcional.
- `Role.code` es estable por tenant; los roles del sistema no se renombran ni eliminan. Permission
  usa `resource.action` y deny-by-default. Un cambio de permisos invalida autorización cacheada.
- Sesión web: el proveedor emite access/refresh token; el browser conserva refresh token sólo en
  cookie `HttpOnly`, `Secure`, `SameSite`; la API valida issuer, audience, expiry y revocación. No se
  usa `X-Tenant-Id` como prueba de pertenencia.
- Soporte cross-tenant exige capability temporal, motivo, ticket, segundo factor, expiración y
  auditoría; nunca reutiliza permisos ordinarios del tenant.
- Los eventos `TenantCreated`, `BrandCreated`, `BranchCreated`, `UserInvited` y
  `UserAuthenticated` refieren IDs estables y no incluyen credenciales ni tokens.

**Sigue bloqueado:** asignación nominal de owner/reviewer y revisión retroactiva del código ya
existente.

## 4. Subscriptions — SPEC-027–036

- El catálogo autoritativo de servicios es versionado y administrado por plataforma. Subscription
  referencia `serviceCode + catalogVersion`; no copia reglas libres creadas por tenant.
- Lifecycle: `TRIAL -> ACTIVE -> SUSPENDED -> CANCELLED`; reactivación crea transición auditada.
  Suspensión bloquea nuevas mutaciones del servicio, conserva lectura/exportación y no borra datos.
- Una baja de cuota con consumo superior queda `PENDING_REMEDIATION`; no elimina datos ni entra en
  vigor hasta volver bajo límite o existir override temporal aprobado.
- Entitlement responde capacidad efectiva; Quota contabiliza consumo. Billing no es autoridad de
  autorización en tiempo real.

## 5. Catalog y Dashboard/Audit — SPEC-037–048

- Product pertenece a un tenant y puede reutilizarse en múltiples menús; MenuItem (o asociación
  equivalente) contiene precio, posición, visibilidad y overrides por menú/version.
- `productStatus` expresa lifecycle editorial; `availability` expresa posibilidad operacional de
  venta. Publicar crea versión inmutable y cambia el puntero activo en una sola transacción.
- La publicación rechaza IDs ausentes, duplicados o cross-menu y congela precio, impuestos,
  modificadores y referencias de assets. Assets admiten tipo/tamaño definidos, checksum,
  sanitización y fallback.
- Dashboard Setup muestra configuración; Dashboard Overview muestra estado operacional actual;
  Analytics muestra series históricas. Ninguno redefine las métricas de otro.
- AuditLog es append-only, encadena integridad por tenant/partición y exporta prueba verificable.

## 6. Floor — SPEC-049–065

- Visit: `OPEN -> CLOSING -> CLOSED`; `CANCELLED` sólo antes de consumo. `CLOSING` impide nuevos
  pedidos y permite completar cobros. Reabrir exige permiso, motivo y ajuste auditado.
- Occupancy es autoridad de asignación de mesas y usa exclusión transaccional por table + ventana.
  TableStatus es una proyección. `RESERVED` tiene precedencia sólo durante la ventana configurada;
  una ocupación activa siempre prevalece.
- El servicio operacional se denomina `ServicePeriod` para no colisionar con un servicio de
  suscripción. No se permiten períodos abiertos solapados por branch; el cierre fuerza o rechaza
  visitas abiertas según política explícita, nunca silenciosamente.
- Check es snapshot comercial cobrable; Invoice es documento fiscal posterior. Un Check puede
  tener pagos parciales, refunds y ajustes cuya suma firmada determina saldo.
- `PaymentProcessed` se divide semánticamente en hechos terminales: `PaymentAuthorized`,
  `PaymentCaptured`, `PaymentFailed`, `PaymentRefunded`; no se emite un éxito genérico.
- Cerrar Visit con saldo o comandos pendientes pasa a `CLOSING`; no queda a elección del adapter.

## 7. Reservations — SPEC-066–080

- La autoridad de capacidad es un ledger transaccional de `CapacityHold`; Availability es una
  proyección/consulta. Confirmar reserva consume o convierte un hold en la misma transacción.
- Reservation: `PENDING -> CONFIRMED -> SEATED -> COMPLETED`; además `CANCELLED`, `EXPIRED` y
  `NO_SHOW` con transiciones explícitas. Cancelar o expirar libera capacidad en la transacción de
  autoridad, no mediante evento eventual.
- Revertir `NO_SHOW` requiere permiso y motivo; cancelar después de `SEATED` está prohibido.
- Waitlist prioriza por regla versionada (hora de alta, tamaño compatible y prioridad autorizada),
  conserva explicación y prohíbe orden manual sin auditoría.
- Guest posee identidad lógica por tenant. Merge crea redirección canónica y ledger reversible;
  unmerge no duplica historial ya emitido. Export/borrado respeta snapshots legales.
- Capacidades públicas de confirmación/cancelación son separadas, expiran, se revocan al uso y no
  exponen la existencia de otros guests.
- Notificaciones registran channel, purpose, template version, consentimiento/base aplicable,
  opt-out, dedupe y resultado.

## 8. Ordering y Kitchen — SPEC-081–110

- Order es agregado comercial; OrderItem es su unidad de fulfillment. El estado de Order se deriva
  determinísticamente de sus items y pagos, no se edita de forma independiente.
- Al submit se revalidan versión de catálogo, disponibilidad, precio, impuestos y restricciones.
  Diferencias requieren aceptación explícita antes de crear el snapshot inmutable.
- Cancelación/modificación parcial genera Adjustment con cantidades, importes, actor, motivo y
  vínculo a cocina/Check. Nunca reescribe el snapshot histórico.
- DigitalBill es proyección versionada del Check; compartir un link no crea una segunda autoridad.
- `OrderSubmitted` expresa aceptación transaccional del pedido; no se usa `OrderPlaced` para hechos
  distintos. Eventos de readiness/delivery incluyen item IDs y soportan cumplimiento parcial.
- KitchenTicket es proyección/ruteo de OrderItem. Command es la unidad ejecutable por estación; no
  duplica ownership comercial.
- Command: `RECEIVED -> IN_PROGRESS -> READY -> COMPLETED`, con `CANCELLED` desde estados no
  terminales. `READY` significa producción terminada; `COMPLETED`, handoff confirmado.
- Payload de Command usa discriminated unions versionadas por tipo. Routing congela station y
  policy version; repriorización registra razón y no altera timestamps originales.
- Alertas tienen fingerprint, umbral/ventana versionados, `OPEN -> ACKNOWLEDGED -> RESOLVED`; una
  nueva violación tras resolución crea ocurrencia nueva o reapertura explícita.

## 9. Workforce — SPEC-111–123

- `Employment` (relación tenant-persona) es autoridad laboral; User sólo autentica. Shift refiere
  Employment y se denomina `WorkShift` para diferenciarlo de ServicePeriod.
- Políticas laborales poseen jurisdicción, vigencia, fuente, versión, aprobación experta y regla de
  precedencia. El sistema calcula alertas; no declara cumplimiento legal autónomamente.
- Clock offline firma device/user/shift/local sequence, registra device time y server receipt time,
  rechaza replay y marca discrepancias para revisión. El servidor determina orden canónico.
- Correcciones de tiempo son ledger append-only con before/after, motivo, aprobador y período de
  nómina afectado. Si el período cerró, generan ajuste retroactivo, no reescritura.
- `TimeEntryStarted/Ended` nombran los hechos de fichaje; `WorkShiftStarted/Ended` sólo se emiten si
  cambia el lifecycle del turno, evitando ambigüedad.

## 10. Cash — SPEC-124–136

- `CashSession` es autoridad de apertura/cierre por register; sólo una sesión abierta por register.
  CashRegister describe el dispositivo/punto, no su saldo temporal.
- CashMovement es ledger firmado: opening, sale, refund, deposit, withdrawal, adjustment y closing.
  El saldo esperado es opening + entradas - salidas, agrupado por moneda/medio; pagos externos no
  se cuentan como efectivo.
- Reconciliation compara expected vs counted por denominación, conserva diferencia y aprobación.
  Pagos tardíos posteriores al cut-off van a la siguiente sesión o a un adjustment enlazado; nunca
  reabren silenciosamente un cierre.
- Discount define política; DiscountApplication es el hecho aplicado al Order/Check y congela
  regla, base, monto, actor y autorización.
- `CashMovementRecorded` reemplaza el ambiguo `CashRegistered`; `CashSessionReconciled` representa
  cierre aprobado.
- Compliance genera hallazgos explicables y requiere resolución humana; no bloquea ni acusa fraude
  sin una regla aprobada.

## 11. Fiscal/ARCA — SPEC-137–156

- FiscalPointOfSale es entidad autoritativa por fiscal entity, tipo de comprobante y ambiente; la
  numeración se serializa allí. No se deriva de Branch ni FiscalPrinter.
- Invoice autorizada es inmutable. No existe transición a `CANCELLED`; correcciones usan nota de
  crédito/débito vinculada al comprobante original.
- `InvoicePrepared` representa borrador local; `InvoiceAuthorizationRequested`,
  `InvoiceAuthorized` y `InvoiceRejected` separan los hechos. `ARCAConfirmed` no duplica
  `InvoiceAuthorized`.
- TaxRate es catálogo normativo versionado con fuente oficial y vigencia; tenants sólo seleccionan
  códigos permitidos u overrides legalmente habilitados.
- La fuente normativa registra organismo, URL/documento, fecha de consulta, vigencia, hash,
  aprobación experta y regla de supersession.
- Reconciliación: suma de líneas + impuestos - descuentos = total Invoice; aplicaciones de pago =
  total cancelado; libro IVA deriva únicamente de comprobantes autorizados y notas vinculadas.
- Certificados se acceden mediante adapter de firma/HSM o secret store; nunca se guardan claves
  privadas en tablas o logs. FiscalPrinter es adapter opcional y no camino crítico general.

**Sigue bloqueado:** validación por especialista fiscal argentino y spike de custodia/firma.

## 12. Feedback y Reputation — SPEC-157–171

- Rating normaliza cada escala a `[0,1]`. ReputationScore es promedio ponderado por fuente,
  recencia y confianza; publica fórmula/version, sample size y ventana. Umbral mínimo suprime tanto
  score como sample size cuando pueda reidentificar.
- ExternalReview conserva source review ID, provenance, timestamps y raw hash; el contenido
  normalizado no sustituye la evidencia original permitida por el proveedor.
- Moderación: `OPEN -> TRIAGED -> ACTION_REQUIRED|NO_ACTION -> RESOLVED`, con apelación y auditoría.
- Consentimiento/tratamiento se define por canal y purpose; feedback interno, review público y
  análisis ML no heredan automáticamente la misma base.
- SentimentAnalysis registra provider/model/prompt version, idioma, confidence y evaluación; baja
  confianza produce `UNDETERMINED`, no sentimiento inventado.
- Submit público usa capability específica, rate limit, anti-bot, sanitización y no permite elegir
  tenant/visit arbitrarios.

## 13. Integrations — SPEC-172–186

- Se separan `InboundWebhookEndpoint` y `OutboundWebhookSubscription`; tienen autenticación,
  retry, replay y lifecycle distintos.
- Cada tipo de recurso declara ownership: `LOCAL`, `REMOTE` o `MERGED`, estrategia de conflicto,
  campos protegidos y autoridad por dirección. Last-write-wins no es default.
- SyncCheckpoint es autoridad de cursor por connector/resource/direction; SyncLog es evidencia de
  ejecución y no reemplaza el checkpoint.
- OAuth callback valida state de un solo uso, PKCE, redirect exacto, tenant/actor/provider binding,
  expiry y nonce. Tokens se cifran mediante adapter de secretos y rotan/revocan.
- Toda URL provista por usuario aplica allowlist/esquema HTTPS, resolución DNS segura, bloqueo de
  redes privadas y redirect revalidation; la regla cubre OAuth, imports, webhooks y tests.
- IntegrationTest es una capability por provider/operación y sólo usa fixtures o dry-run declarado;
  no existe un endpoint genérico para ejecutar requests arbitrarios.

**Sigue bloqueado:** elección y costo de providers, adapter de secretos y spikes por conector.

## 14. Analytics y AI — SPEC-187–206

- Un Data Registry versionado es autoridad de eventos, features y métricas: owner, schema,
  clasificación, retención, lineage y compatibilidad. No se ingiere un evento desconocido.
- Ingesta autentica fuente, limita volumen/tamaño, valida schema y timestamp, deduplica y pone en
  cuarentena abuso o datos tardíos fuera de ventana.
- MetricDefinition usa DSL declarativa sin código, joins o acceso a red; aplica límites de ventana,
  cardinalidad, scan y tiempo. Toda consulta estima costo antes de ejecutarse.
- Model registry guarda dataset/hash, features, código/config, seed, métricas por segmento,
  aprobaciones, artefacto, rollout y rollback. Predicciones citan model version y feature snapshot.
- Todo contexto LLM se filtra por tenant y clasificación antes de retrieval. Tool output se trata
  como no confiable; prompt injection no puede ampliar scopes ni revelar system prompts/secrets.
- Alert/Insight: `OPEN -> ACKNOWLEDGED -> RESOLVED|DISMISSED`, con fingerprint, cooldown,
  suppression y explicación. Repeticiones dentro de ventana agregan ocurrencias.
- Autopilot sólo ejecuta acciones de catálogo: Tier 0 read-only; Tier 1 reversible con aprobación
  configurable; Tier 2 financiera/externa requiere aprobación humana; Tier 3 destructiva,
  cross-tenant o cambio de permisos queda prohibida. Toda acción tiene idempotencia, dry-run,
  precondiciones, compensación y auditoría.

**Sigue bloqueado:** runtime/model/provider, presupuesto, evaluación y spikes de costo/privacidad.

## 15. Plataforma y gobernanza — SPEC-207–226

- El DAG normativo debe ser acíclico: foundations/ADRs -> contracts -> domain -> adapters -> apps ->
  deploy/operations. Una spec no depende de su consumidor para definir su propia autoridad.
- Lifecycle y readiness usan exclusivamente los enums de SPEC-225. Una implementación existente se
  registra `IN_PROGRESS/BLOCKED` hasta revisión retroactiva; existencia de tests no equivale a
  aprobación.
- Los quality gates adoptan baseline versionada que sólo puede reducirse. Un hallazgo nuevo falla
  CI; el baseline no se expande para aprobar cambios.
- Offline/realtime se decide por comando: comandos financieros, fiscales, capacidad exclusiva,
  permisos y secretos requieren autoridad online; captura offline admisible usa sequence,
  idempotencia, sync state, conflicto explícito y reconciliación.
- Budgets, restore, RPO/RTO y exit strategy requieren medición reproducible sobre ambiente y commit
  identificados. Hasta entonces su resultado es `NOT_RUN`, nunca PASS documental.

## 16. Criterios de aceptación documental

Una spec individual deja de ser placeholder sólo cuando:

1. identifica ID, tipo, fase, prioridad, estado, readiness, owner por rol, reviewer y dependencias;
2. enlaza la autoridad y reglas transversales aplicables de este documento;
3. define happy path, errores, concurrencia, idempotencia y aislamiento;
4. para eventos, fija nombre de hecho, trigger transaccional, envelope, schema y consumidores;
5. para PII/dinero/fiscal/AI, define threat model, retención/provenance y revisión especializada;
6. incluye criterios verificables sin marcar como completada una prueba no ejecutada;
7. recibe revisión humana sobre el mismo commit y no mantiene blockers P0.

## 17. Pendientes que no se pueden cerrar sólo escribiendo specs

- Asignar personas responsables y reviewers independientes.
- Aprobar o rechazar ADR-002, ADR-003 y ADR-004.
- Ejecutar SPK-01–06 y registrar ambiente, commit, comandos, evidencia y mediciones.
- Validar reglas fiscales y laborales con especialistas y fecha de vigencia.
- Elegir providers/conectores después de comprobar costo, ToS, cuotas y exit strategy.
- Demostrar backup/restore, RPO/RTO y límites reales del free tier.
- Migrar cada README placeholder a metadata canónica y realizar peer review por bloque.

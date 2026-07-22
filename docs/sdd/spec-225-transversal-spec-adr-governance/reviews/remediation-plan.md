# Plan de remediación de contratos

Este plan ordena la resolución de findings de la primera revisión SPEC-001–226. Es documental:
no autoriza implementación, no asigna personas por inferencia y no cambia estados automáticamente.

## Principios

1. Un gate se cierra con evidencia y reviewer, no por completar una lista informal.
2. Se resuelven autoridades e invariantes antes que APIs, eventos, UI o adapters dependientes.
3. Cambios incompatibles reabren consumidores y actualizan schemas/tests en el mismo cambio.
4. El código existente se revisa contra las specs; no se modifica la spec sólo para justificarlo.
5. Free tier, seguridad, accesibilidad, observabilidad y portabilidad son criterios de entrada.

## Gate R0 — Control de gobernanza

Objetivo: restablecer una ruta SDD auditable.

- Asignar owner/reviewer a SPEC-207, 225, 226 y ADR-002/003/004.
- Elegir enum canónico de readiness y migrar valores históricos con schema/baseline/tests.
- Eliminar ciclos SPEC-210/211/212/214/220/226 y validar DAG completo.
- Inventariar commits `feat` adelantados: commit, specs, criterios, tests y excepciones.
- Definir el workflow finding `OPEN → IN_REVIEW → RESOLVED/ACCEPTED_EXCEPTION` en tooling futuro.

Evidencia de salida:

- validación determinista de metadata/DAG sin drift nuevo;
- approvals humanas contra commit exacto;
- auditoría retroactiva publicada sin reescribir historia;
- ningún nuevo `feat` sobre una spec no autorizada.

## Gate R1 — Plataforma I0 verificable

Objetivo: decidir y demostrar el foundation gratuito/portable.

- Ejecutar SPK-01–06 de SPEC-226 con mediciones y cleanup.
- Aceptar, rechazar o superseder ADR-002/003/004 según evidencia.
- Documentar integración Vercel/Supabase: owners, proyectos, ambientes, quotas y variables.
- Ejecutar baseline de format/lint/typecheck/tests/build/security/secret scan/Sonar-equivalent.
- Medir budgets free-tier y configurar thresholds/degradación/kill switches.
- Probar backup/export/restore y salida a PostgreSQL/identity adapters alternativos.

Evidencia de salida:

- spike results PASS/FAIL/INCONCLUSIVE reproducibles;
- ADRs con estado y consecuencias coherentes;
- demo/preview aisladas sin secretos ni acceso productivo;
- restore probado con RPO/RTO medidos;
- gates CI gratuitos definidos y ejecutados sobre HEAD.

## Gate R2 — Autoridades fundacionales

Objetivo: fijar identidad, permisos, catálogo y datos compartidos.

- Resolver ciclo User↔Membership y estrategia browser/session.
- Canonicalizar Role/Permission y mapear aliases MAÎTRE/MAITRE, HOST, workforce, kitchen y analytics.
- Definir catálogo versionado de services/entitlements/config schemas.
- Definir Product/revision/snapshot y separar availability configurada/operativa.
- Fijar política de audit atomicity, tamper evidence y privileged support boundary.
- Publicar matrices de PII/consent/retention/export/delete por dominio.

Evidencia de salida:

- diagramas y metadata acíclicos;
- matrices endpoint/command→permission→scope;
- schemas/fixtures dorados para roles, service catalog y product snapshots;
- pruebas negativas cross-tenant, self-grant, revocation y redaction especificadas.

## Gate R3 — Operación gastronómica coherente

Objetivo: resolver state machines y concurrencia antes de estabilizar APIs/eventos.

- Definir lifecycle de Visit y relación Service/Shift.
- Definir autoridad/constraint de reservation capacity y release transaccional.
- Unificar Order/OrderItem/KitchenTicket/Command y máquina Kitchen.
- Definir parcialidad: cancel, ready, delivery, modifications y compensations.
- Renombrar hechos ambiguos (`OrderPlaced`, `PaymentProcessed`) antes de consumidores.
- Fijar envelopes, revisions, causation y events parciales.

Evidencia de salida:

- tablas de transición completas y sin enums contradictorios;
- tests de concurrencia confirm/cancel/seat y submit/cancel/ready;
- diagrama write model→outbox→projection con recovery;
- contract schemas compatibles para APIs/eventos.

## Gate R4 — Dinero, caja y fiscalidad

Objetivo: una sola contabilidad de importes y hechos fiscales.

- Definir Payment ledger: intent/capture/refund/void, parciales, propina y saldo.
- Modelar CashSession y journal mappings desde Payment/CashMovement.
- Fijar close/reconciliation ante callbacks tardíos y settlement equations.
- Corregir Invoice lifecycle y modelar FiscalPointOfSale.
- Gobernar fuentes oficiales, TaxRate, numbering, QR y export Libro IVA.
- Reconciliar Check→Payment→Cash→Invoice→Libro IVA con fixtures dorados.

Evidencia de salida:

- ecuaciones decimales y rounding versionados;
- idempotency/reconciliation para timeout y mensajes tardíos;
- homologación ARCA y revisión fiscal competente;
- secrets/certificados rotables sin exposición;
- ninguna afirmación de presentación IVA automática no comprobada.

## Gate R5 — Capacidades posteriores al MVP

Objetivo: permitir sólo features sostenibles y justificadas.

- Workforce: employment authority y policy provenance por jurisdicción.
- Feedback: fórmula de reputación, privacidad y spikes por plataforma.
- Integrations: separar inbound/outbound webhooks y definir ownership/conflict matrices.
- Analytics: data registry, metric DSL sandbox y model evaluation lineage.
- IA: spikes de costo/runtime; Autopilot suggestion-only hasta action risk registry aprobado.

Evidencia de salida:

- providers seleccionados con API/cuotas/costo/términos verificados;
- fallbacks manuales/deterministas;
- eval datasets y thresholds versionados;
- human review y kill switches demostrados;
- feature flags/entitlements no habilitan capacidades bloqueadas.

## Política de avance

Puede trabajarse en paralelo dentro de un gate sólo cuando no comparta una autoridad todavía
abierta. Un gate posterior puede producir research/spikes, pero no congelar contratos ni código
productivo dependiente. La revisión de salida actualiza findings, consumidores afectados y
registro; `READY_FOR_IMPLEMENTATION` continúa siendo una decisión humana separada.

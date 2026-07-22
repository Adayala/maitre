# Revisión de contratos — Integrations SPEC-172–186

| Campo | Valor |
| --- | --- |
| Alcance | SPEC-172–186 |
| Commit revisado | `1c04f66` |
| Protocolo | `contract-review-checklist.md` |
| Outcome | `BLOCKED` |
| Autoridad para implementar | No otorgada |

## Resultado ejecutivo

El bloque encapsula providers detrás de puertos, separa configuración de secretos, usa OAuth
PKCE/state, valida firmas raw-body, deduplica webhooks y avanza cursores sólo tras persistencia.
Los conectores contemplan idempotencia, timeouts ambiguos, rate limits y reconciliación.

La aprobación queda bloqueada por metadata provisoria y por mezclar webhooks salientes de
Maitre con callbacks entrantes de providers bajo una misma entidad/API.

## Findings bloqueantes

### INT-REV-001 — Metadata provisoria en todo el bloque

- Severidad: alta.
- Evidencia: SPEC-172–186 mantienen type, phase y priority `TBD`, sin owner/reviewer ni
  dependencias autoritativas.
- Resolución: normalizar quince README con SPEC-225 y asignar responsables.

### INT-REV-002 — Webhooks inbound/outbound mezclados

- Severidad: alta.
- Evidencia: WebhookSubscription define endpoint tenant, secreto y política de entrega
  saliente; SPEC-178 también recibe webhooks de providers con su firma/deduplicación.
- Riesgo: SSRF, secret ownership, retry, IDs y permisos quedan aplicados al flujo equivocado.
- Resolución: separar OutboundWebhookSubscription/Delivery de ProviderWebhookEndpoint/Receipt,
  con schemas, secretos, threat models, DLQ y lifecycle independientes.

### INT-REV-003 — Ownership/conflictos por recurso sin matriz normativa

- Severidad: alta.
- Evidencia: POS bidireccional declara ownership explícito, pero no lo define; Accounting y
  Payments también pueden devolver estados que compiten con Maitre.
- Riesgo: loops de sync, last-write-wins accidental y corrupción de catálogo/pago/cierre.
- Resolución: matriz provider/resource/field/direction/authority/conflict/delete, versionada por
  instalación, con ejemplos de replay/backfill y reconciliación.

### INT-REV-004 — Providers/costos no validados para MVP

- Severidad: alta.
- Evidencia: puertos genéricos no demuestran que pagos, contabilidad o POS elegidos tengan API,
  sandbox, webhooks, cuotas y costo compatibles con free tier.
- Resolución: spikes fechados por provider con fuentes oficiales, PASS/FAIL/INCONCLUSIVE, costo,
  límites, requisitos contractuales y alternativa manual/export.

## Findings medios

### INT-REV-005 — Secret manager/rotación requieren adapter inicial

Definir dónde viven tokens/secrets en local, CI, Vercel y producción; encryption/access,
rotation overlap, backup, deletion y export. Las referencias no deben ser URLs manipulables ni
permitir confused deputy entre tenants.

### INT-REV-006 — OAuth callback necesita bind completo

State one-time debe ligar tenant, actor, integration, provider, redirect y PKCE, expirar y
consumirse atómicamente. Reauthorization no puede reemplazar credenciales de otra instalación;
revocación debe afectar jobs/sesiones en curso.

### INT-REV-007 — SSRF aplica a más que test/webhook

Validar/allowlist endpoints y resolver DNS/IP en cada conexión relevante, bloquear redirects a
red privada/metadata, limitar puertos/protocolos y egress. Config de provider preferentemente no
acepta URLs arbitrarias.

### INT-REV-008 — SyncLog no sustituye checkpoint autoritativo

Definir SyncRun/Checkpoint transaccional, partición, cursor original/nuevo, lease, retry y
recovery. Un log append-only puede evidenciar, pero no coordinar ejecuciones incompatibles por sí
solo.

### INT-REV-009 — IntegrationTest debe ser capability específica

“Sin efectos laterales” debe estar demostrado por provider/capability; algunos tests crean
objetos sandbox. Declarar side effects, cleanup, budget, rate limit y prohibición productiva.

### INT-REV-010 — Roles no canónicos

`operator`, `integration admin` y `tenant admin` deben mapear a permission assignments/roles
versionados. Autorizar OAuth, rotar secretos, sync y administrar outbound webhooks son permisos
distintos con step-up/segregación cuando aplique.

## Evidencia positiva

- Tokens/secrets no aparecen en dominio, APIs, eventos ni logs.
- OAuth usa PKCE, state, redirect allowlist y scopes mínimos.
- Webhooks entrantes validan firma sobre bytes crudos, timestamp y replay.
- Sync diferencia parcial/completo, es idempotente y conserva cursores.
- Status declara freshness y evita checks caros en lectura.
- Payment connector consulta timeouts ambiguos y evita PAN/CVV.
- Accounting/POS usan mappings versionados, IDs externos y reconciliación.
- IntegrationSynced minimiza payload y distingue outcome/conteos.

## Próxima revisión

Revisar después de resolver INT-REV-001–004. La evidencia debe incluir separación inbound/outbound,
matriz de ownership, secret adapter, OAuth bind tests, SSRF suite y spikes oficiales de los
providers seleccionados.

# Contrato de validación de links externos — SPEC-225

## Propósito

Definir un job programado, seguro y reproducible para evaluar URLs externas referenciadas por
documentación. Una falla de disponibilidad externa no vuelve indeterminista el gate de pull request.

Este contrato no ejecuta requests, no crea CI y no declara ninguna URL válida.

## Separación de gates

```text
PR_STATIC_GATE
  extracción + sintaxis + scheme + placeholders + seguridad obvia
  sin red

SCHEDULED_NETWORK_AUDIT
  DNS + redirect chain + HTTP outcome
  con red controlada
  no bloquea un PR individual por indisponibilidad transitoria
```

Hallazgos estáticos de URL insegura/malformada sí pueden bloquear el gate documental. Outcomes de
red alimentan findings/ratchet y requieren confirmación antes de cambiar links.

## Estado

```yaml
externalLinkValidation:
  schemaVersion: 1
  status: PROPOSED_FOR_REVIEW
  schedule: WEEKLY_PROPOSED
  networkJob: NOT_IMPLEMENTED
  owner: UNASSIGNED
  reviewers: [UNASSIGNED]
  baseline: NOT_FROZEN
```

`WEEKLY_PROPOSED` no programa nada hasta aprobación de operaciones/seguridad.

## Extracción

Usa el parser Markdown definido por NAVL:

- links inline y de referencia;
- autolinks HTTP(S) soportados;
- URLs no extraídas desde fenced/inline code;
- imágenes externas clasificadas por separado;
- raw HTML sólo si su parser fue aprobado;
- texto que parece URL pero no es link queda `UNLINKED_URL_TEXT`, visible pero no chequeado como
  link;
- placeholders/examples se clasifican, no se consultan.

La regex de baseline no constituye parser ni fixture aprobada.

## Clasificación previa

```text
HTTP_URL | HTTPS_URL | PLACEHOLDER | EXCLUDED_EXAMPLE |
UNLINKED_URL_TEXT | UNSUPPORTED_SCHEME | MALFORMED | UNSAFE_STATIC
```

Indicadores de placeholder:

- host/path contiene tokens declarados (`...`, `<host>`, `{id}`, `example.invalid`);
- sintaxis pertenece a template/example marcado;
- comillas/backticks/puntuación quedaron incluidas por extracción defectuosa;
- dominio no cumple parsing IDNA/URL aprobado.

No se consulta red para decidir si algo “parece placeholder”.

## Normalización e identidad

La identidad de URL conserva:

- scheme normalizado a lowercase;
- host IDNA/case normalizado por librería/version aprobada;
- puerto explícito salvo default canónico;
- path/query exactos tras parsing seguro;
- fragment separado: no se envía al servidor.

No se:

- ordenan query params;
- eliminan tokens sospechosos;
- convierten HTTP→HTTPS automáticamente;
- quitan trailing slash;
- expanden shorteners;
- deduplican URLs que difieren en path/query.

Queries sensibles bloquean/redactan; nunca se persisten ni solicitan.

## Seguridad de red

Antes de cada request y redirect:

1. parsear URL sin credenciales embebidas;
2. admitir sólo `http`/`https`;
3. resolver DNS con resolver controlado;
4. rechazar toda IP privada, loopback, link-local, multicast, reserved y metadata endpoint;
5. fijar/validar IP para evitar DNS rebinding;
6. volver a evaluar cada redirect;
7. limitar redirects, tamaño y tiempo;
8. no enviar cookies, auth, referer, secrets ni headers del usuario;
9. usar egress policy/allow rules del runner;
10. registrar sólo metadata redactada.

Se rechazan userinfo, IP literals no autorizados, puertos no permitidos y schemes que cambien en
redirect. Una allowlist no habilita acceso a IP privada.

## Política HTTP propuesta

```yaml
requestPolicy:
  userAgent: <identidad/version/contacto aprobados>
  firstMethod: HEAD
  fallbackMethod: GET
  getRangeBytes: 4096
  connectTimeoutMs: 5000
  totalTimeoutMs: 15000
  maxRedirects: 5
  maxAttempts: 2
  retryBackoff: DETERMINISTIC_BOUNDED
  concurrencyPerHost: 2
  globalConcurrency: 10
  cookies: DISABLED
  credentials: DISABLED
```

Los valores son propuesta inicial y requieren review operativo. `GET` sólo se usa cuando HEAD no es
soportado o no permite clasificar; no descarga bodies completos.

## Outcomes

```text
VALID | REDIRECT_STABLE | AUTH_REQUIRED | RATE_LIMITED |
TRANSIENT_FAILURE | PERMANENT_FAILURE | TLS_FAILURE |
UNSAFE | PLACEHOLDER | EXCLUDED | NOT_CHECKED
```

- `VALID`: respuesta 2xx bajo policy.
- `REDIRECT_STABLE`: chain segura termina 2xx; puede abrir recomendación de canonical URL.
- `AUTH_REQUIRED`: 401/403; no se intenta autenticar.
- `RATE_LIMITED`: 429/retry-after; no se fuerza.
- `TRANSIENT_FAILURE`: timeout, DNS temporal o 5xx sujeto a confirmación.
- `PERMANENT_FAILURE`: 404/410 o fallo confirmado según policy.
- `TLS_FAILURE`: certificado/hostname/protocolo inválido; no se desactiva TLS.
- `UNSAFE`: URL/resolve/redirect viola seguridad.
- `NOT_CHECKED`: falta capacidad/configuración; no equivale a válido.

## Confirmación y lifecycle

Una observación única no declara link roto definitivo.

```text
OBSERVED → CONFIRMATION_PENDING → CONFIRMED |
  TRANSIENT | OWNERSHIP_BLOCKED | RESOLVED | ACCEPTED_EXCEPTION
```

- `PERMANENT_FAILURE` requiere dos ejecuciones separadas por ventana aprobada, salvo 410 inequívoco
  revisado.
- `TRANSIENT_FAILURE`, 429 y 5xx no promueven automáticamente.
- `UNSAFE` se registra inmediatamente y bloquea nuevas requests.
- Cambiar/remover URL requiere owner/reviewer y reconciliar contenido/autoridad.

## Redirects

Cada hop registra status y URL redactada/hash.

- redirect a private/local/metadata: `UNSAFE`;
- loop o más de 5: failure;
- HTTPS→HTTP: finding de downgrade;
- cambio de dominio: visible y sujeto a policy;
- redirect estable no reescribe documentación automáticamente;
- fragment permanece local y no participa del request.

## Baseline sintáctico

Escaneo regex previo al parser:

```yaml
baselineId: XURL-BASE-001
status: SYNTACTIC_OBSERVATION_NOT_FROZEN
filesWithHttpText: 14
urlLikeOccurrences: 40
rawHostTokens: 18
parsedMarkdownLinks: NOT_ASSESSED
networkChecked: 0
confirmedValid: 0
confirmedBroken: 0
```

Entre los raw host tokens aparecen placeholders/puntuación (`s3...`, `...`, host con quote/backtick)
además de dominios plausibles. Por eso `rawHostTokens: 18` no significa 18 dominios consultables.

## Evidence record

```yaml
externalLinkObservation:
  observationId: XURL-OBS-NNN
  subjectCommit: <sha completo>
  source:
    documentId: <SDD-DOC o legacy path + hash>
    line: <entero>
    rawTargetHash: sha256:<hex>
  normalizedUrl:
    redacted: <url sin valores sensibles>
    identityHash: sha256:<hex>
  classification: <enum>
  policyHash: sha256:<hex>
  dns:
    outcome: SAFE_PUBLIC | UNSAFE | FAILED | NOT_RUN
    addressHashes: [<hashes, no datos sensibles>]
  http:
    attempts: <entero>
    finalStatus: <status o null>
    redirectCount: <entero>
    outcome: <enum>
  findingRef: <ID o null>
```

No se guarda response body, IP sensible completa, query secrets ni headers.

## Ratchet

- nuevas URLs deben pasar static gate;
- nuevos `UNSAFE_STATIC/UNSAFE` fallan;
- confirmed permanent failures no aumentan sin finding;
- resolver un finding reduce baseline y no se reabre con ID reciclado;
- `NOT_CHECKED` no se convierte a `VALID`;
- actualizar baseline requiere owner, razón y review;
- caída masiva de un proveedor abre incident/finding agrupado sin duplicar cientos de excepciones.

## Códigos

| Código | Condición |
| --- | --- |
| `XURL001` | URL/schema/clasificación inválida |
| `XURL002` | scheme/userinfo/port/query inseguro o no permitido |
| `XURL003` | placeholder/example mal clasificado o parser drift |
| `XURL004` | DNS/IP/rebinding/metadata policy violada |
| `XURL005` | redirect inválido, inseguro, cíclico o excesivo |
| `XURL006` | TLS/hostname/protocolo inválido |
| `XURL007` | request excede timeout/size/method/rate policy |
| `XURL008` | outcome HTTP mal clasificado o confirmación insuficiente |
| `XURL009` | evidence incompleta, stale o no determinista |
| `XURL010` | baseline/finding/excepción inválido |
| `XURL011` | secret/PII/body/header sensible expuesto |
| `XURL012` | review/ownership/remediación incompatible |

## Scheduling y operación

- runner aislado, sin acceso a redes internas/secrets;
- ejecución manual y scheduled comparten policy;
- resultados se agrupan por subject commit/policy;
- cache sólo con TTL/policy hash y nunca oculta `UNSAFE`;
- budget máximo de requests por run;
- cancelación segura ante rate limiting/incidente;
- job reporta salud propia separada de salud de links.

No se fija proveedor/runner hasta review de SPEC-207/221/214.

## Criterios de salida

- [x] Extracción, clasificación, seguridad y outcomes especificados.
- [x] Redirects, confirmación, evidence y ratchet especificados.
- [x] Baseline sintáctico sin afirmar validación relevado.
- [x] Doce códigos definidos.
- [x] Especificar fixtures `XURL`.
- [ ] Aprobar policy/schedule/runner.
- [ ] Parsear baseline real con NAVL.
- [ ] Implementar auditor sólo después de aprobación.

Los últimos tres checks permanecen abiertos. Los casos normativos están definidos en
`external-link-validation-fixture-catalog.md`; `networkChecked=0`.

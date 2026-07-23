# Catálogo de fixtures XURL schema v1 — SPEC-225

## Propósito

Definir escenarios de conformidad para el static gate y auditor programado de links externos. Las
respuestas DNS/HTTP son simuladas; este catálogo no accede a red.

## Formato

```yaml
id: XURL-FIX-NNN
kind: STATIC | NETWORK | SECURITY | LIFECYCLE | DETERMINISM
input:
  markdown: <fixture>
  policy: <policy ref>
  dnsScript: [<respuestas simuladas>]
  httpScript: [<respuestas simuladas>]
expected:
  outcome: ACCEPT | REJECT | MARK_STALE
  classification: <enum>
  codes: [XURLxxx]
  requests: <entero>
```

## Extracción y clasificación válidas

### XURL-FIX-001 — HTTPS inline

Link Markdown HTTPS bien formado.

Expected: static `HTTPS_URL`; network audit elegible.

### XURL-FIX-002 — HTTP visible

Link HTTP permitido para auditoría pero con finding de downgrade/policy.

Expected: `HTTP_URL`; no se convierte a HTTPS automáticamente.

### XURL-FIX-003 — Reference link

Definition HTTP(S) válida usada por un link.

Expected: una identidad URL por definition/uso según parser, sin request duplicado innecesario.

### XURL-FIX-004 — Autolink

Autolink soportado por profile/parser aprobado.

Expected: elegible.

### XURL-FIX-005 — External image

Imagen HTTPS.

Expected: clasificación external asset separada; policy puede auditarla sin volverla nodo Markdown.

### XURL-FIX-006 — Fenced example

URL dentro de fenced code.

Expected: `EXCLUDED_EXAMPLE`; requests 0.

### XURL-FIX-007 — Inline code

Expected: no link extraído; requests 0.

### XURL-FIX-008 — Placeholder

Hosts/tokens `s3...`, `<host>`, `{id}`, `example.invalid`.

Expected: `PLACEHOLDER`; requests 0.

### XURL-FIX-009 — URL-like text

Texto plano no enlazado.

Expected: `UNLINKED_URL_TEXT`; visible, requests 0.

### XURL-FIX-010 — Fragment externo

URL con `#section`.

Expected: fragment separado y nunca enviado; identidad/request sin fragment.

### XURL-FIX-011 — Query no sensible

Query se conserva en orden exacto.

Expected: no ordenar/eliminar params.

### XURL-FIX-012 — IDNA válido

Host Unicode válido se normaliza con versión IDNA fijada.

Expected: identidad determinista y auditable.

## Static gate inválido

### XURL-FIX-013 — URL malformada

Expected: `REJECT [XURL001]`; requests 0.

### XURL-FIX-014 — Scheme desconocido

`ftp`, `file`, `javascript` u otro no permitido.

Expected: `REJECT [XURL001, XURL002]`; requests 0.

### XURL-FIX-015 — Userinfo

URL contiene `user:password@host`.

Expected: `REJECT [XURL002]`; valor redactado; requests 0.

### XURL-FIX-016 — Puerto no permitido

Expected: `REJECT [XURL002]`; requests 0.

### XURL-FIX-017 — Query sensible

Token, key, signature, session o credential.

Expected: `REJECT [XURL002, XURL011]`; no persistir valor/hash sensible; requests 0.

### XURL-FIX-018 — Placeholder consultado

Classifier marca `s3...` como HTTP URL y genera request.

Expected: `REJECT [XURL003]`.

### XURL-FIX-019 — Puntuación capturada

Extractor incluye quote/backtick/coma/cierre Markdown en host/path.

Expected: `REJECT [XURL003]`; parser fixture debe separar target correcto o clasificar malformed.

### XURL-FIX-020 — Fenced URL consultada

Expected: `REJECT [XURL003]`.

## DNS y SSRF

### XURL-FIX-021 — DNS público seguro

Host resuelve sólo IP pública admitida.

Expected: `SAFE_PUBLIC`; continúa HTTP.

### XURL-FIX-022 — Loopback

IPv4/IPv6 loopback directo o por DNS.

Expected: `REJECT [XURL004]`, outcome `UNSAFE`; requests HTTP 0.

### XURL-FIX-023 — Private/link-local

RFC1918, ULA, link-local, multicast o reserved.

Expected: `REJECT [XURL004]`.

### XURL-FIX-024 — Metadata endpoint

Hostname/IP de metadata cloud.

Expected: `REJECT [XURL004]`.

### XURL-FIX-025 — DNS mixto

Host devuelve una IP pública y una privada.

Expected: `REJECT [XURL004]`; no elegir sólo la pública.

### XURL-FIX-026 — DNS rebinding

Preflight público, conexión/redirect resuelve privado.

Expected: `REJECT [XURL004]`; IP se fija/revalida.

### XURL-FIX-027 — IP literal

Literal decimal/hex/octal/IPv6 que representa red prohibida.

Expected: `REJECT [XURL004]`; no evadir parser.

## Redirects

### XURL-FIX-028 — Redirect estable

Uno o dos hops públicos seguros terminan 200.

Expected: `REDIRECT_STABLE`; chain completa registrada.

### XURL-FIX-029 — Redirect a privado

Expected: `REJECT [XURL005, XURL004]`.

### XURL-FIX-030 — Redirect loop

Expected: `REJECT [XURL005]`.

### XURL-FIX-031 — Demasiados redirects

Más de policy max.

Expected: `REJECT [XURL005]`.

### XURL-FIX-032 — HTTPS a HTTP

Expected: finding `XURL005`; no reescritura automática.

### XURL-FIX-033 — Redirect a scheme prohibido

Expected: `REJECT [XURL005, XURL002]`.

### XURL-FIX-034 — Cambio de dominio

Ambos hosts públicos/seguros.

Expected: outcome visible sujeto a policy; nunca se oculta hop.

## TLS y request policy

### XURL-FIX-035 — TLS válido

Hostname/certificate/protocol válidos.

Expected: continúa; no secrets.

### XURL-FIX-036 — Cert expirado/hostname mismatch

Expected: `REJECT [XURL006]`, outcome `TLS_FAILURE`; no desactivar verificación.

### XURL-FIX-037 — HEAD 405, GET range válido

Expected: fallback GET limitado; `VALID`.

### XURL-FIX-038 — HEAD suficiente

HEAD 200.

Expected: no GET adicional.

### XURL-FIX-039 — Body excede límite

Server ignora Range/envía body grande.

Expected: cancelar y `REJECT [XURL007]`; no almacenar body.

### XURL-FIX-040 — Timeout

Expected: intentos acotados; `TRANSIENT_FAILURE`, código `XURL007` si viola policy.

### XURL-FIX-041 — Concurrencia/rate excedida

Expected: `REJECT [XURL007]`.

### XURL-FIX-042 — 429

Expected: `RATE_LIMITED`; respeta Retry-After/budget, no marca permanent failure.

## Outcomes y confirmación

### XURL-FIX-043 — 200

Expected: `VALID`.

### XURL-FIX-044 — 401/403

Expected: `AUTH_REQUIRED`; no intenta credenciales.

### XURL-FIX-045 — 404 único

Expected: `CONFIRMATION_PENDING`; no `CONFIRMED` automático.

### XURL-FIX-046 — 404 confirmado

Dos runs separados según ventana/policy.

Expected: `PERMANENT_FAILURE/CONFIRMED`.

### XURL-FIX-047 — 410 revisado

Expected: puede confirmar según policy/evidence; no elimina link.

### XURL-FIX-048 — 500 intermitente

Expected: `TRANSIENT_FAILURE`; no permanent.

### XURL-FIX-049 — DNS temporal

Expected: `TRANSIENT_FAILURE`.

### XURL-FIX-050 — Outcome mal clasificado

429 como broken o 401 como valid.

Expected: `REJECT [XURL008]`.

### XURL-FIX-051 — Confirmación insuficiente

Un timeout/404 abre `CONFIRMED`.

Expected: `REJECT [XURL008]`.

## Evidence, ratchet y seguridad

### XURL-FIX-052 — Evidence completa

Commit/source hash, policy hash, classification, DNS/HTTP outcomes y finding refs coherentes.

Expected: `ACCEPT`.

### XURL-FIX-053 — Evidence stale/incompleta

Falta policy/source hash o commit cambió.

Expected: `MARK_STALE [XURL009]`.

### XURL-FIX-054 — Orden variable

Mismos observations en distinto orden.

Expected: report byte-idéntico; de lo contrario `REJECT [XURL009]`.

### XURL-FIX-055 — Baseline crece

Nuevo confirmed failure/unsafe sin finding.

Expected: `REJECT [XURL010]`.

### XURL-FIX-056 — Excepción inválida

Sin owner/razón/mitigación/vencimiento o intenta exceptuar SSRF.

Expected: `REJECT [XURL010]`.

### XURL-FIX-057 — Provider outage agrupado

Muchas URLs del mismo proveedor fallan transitoriamente.

Expected: finding agrupado + filas visibles; no cientos de excepciones ni links eliminados.

### XURL-FIX-058 — Headers/body sensibles

Evidence persiste Set-Cookie, auth, response body, signed query o IP sensible completa.

Expected: `REJECT [XURL011]`.

### XURL-FIX-059 — Remediación sin ownership

Job cambia/elimina URL automáticamente.

Expected: `REJECT [XURL012]`.

### XURL-FIX-060 — Review stale

Cambio de URL/policy/commit después de decisión.

Expected: `MARK_STALE [XURL012]`.

## Matriz de cobertura

| Área | Fixtures |
| --- | --- |
| extracción/clasificación | 001–020 |
| DNS/SSRF | 021–027, 029 |
| redirects | 028–034 |
| TLS/request policy | 035–042 |
| outcomes/confirmación | 043–051 |
| evidence/ratchet/seguridad | 052–060 |

Todos los códigos `XURL001`–`XURL012` poseen al menos un caso negativo.

## Criterios de salida

- [x] Extracción, placeholders y static gate cubiertos.
- [x] SSRF, DNS rebinding, redirects y TLS cubiertos.
- [x] HTTP outcomes, confirmación y rate limiting cubiertos.
- [x] Evidence, ratchet, seguridad y ownership cubiertos.
- [x] Doce códigos cubiertos.
- [ ] Materializar fixtures con DNS/HTTP simulados.
- [ ] Aprobar policy/catalog mediante DOC-REV.
- [ ] Implementar auditor sólo después de aprobación.

Los últimos tres checks permanecen abiertos.

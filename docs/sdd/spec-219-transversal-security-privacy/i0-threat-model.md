# Threat model y matriz de datos I0 — SPEC-219

## Alcance

Recorrido: login mediante proveedor → bearer token → `/v1/me/context` → selector autorizado → Dash shell → logout. Health live/ready y CI/deployment forman parte del soporte técnico.

Fuera de alcance: registro público, invitados reales, archivos, pagos, ARCA, email, webhooks, offline writes y datos comerciales reales.

## Activos

- identidad externa y sesión del usuario sintético;
- User/Membership/roles/branch scopes de Maitre;
- Tenant/Branch sintéticos;
- schema, migraciones y policies RLS;
- secrets de deployment y credenciales DB;
- integridad de source, lockfile, workflows y artifacts;
- disponibilidad limitada de demo y capacidad de restore.

## Trust boundaries

```text
Persona/browser no confiable
  ├── HTTPS -> Supabase Auth candidato
  └── HTTPS -> Vercel/API Maitre
                  ├── token -> SessionVerificationPort/JWKS
                  └── pooled DB connection -> PostgreSQL/RLS

Developer/GitHub
  └── CI artifact -> Vercel deployment

Owners de plataforma
  └── dashboards/secrets -> Vercel/Supabase control planes
```

El browser, headers, token claims no estándar, IDs y responses del proveedor son inputs no confiables. CI y dashboards son boundaries privilegiados, no extensiones implícitas del dominio.

## Amenazas prioritarias

| ID | Amenaza | Control requerido | Evidencia I0 |
| --- | --- | --- | --- |
| TM-01 | token falsificado/issuer incorrecto | firma, issuer, audience, alg allowlist, exp/nbf | contract tests SPEC-023/SPK-03 |
| TM-02 | claims de rol/tenant manipulados | autorización desde User/Membership persistidos | token canario no amplía acceso |
| TM-03 | IDOR Tenant A → B | RequestContext, repository predicates, RLS | tests DB/API positivos y negativos |
| TM-04 | membership/User suspendido conserva acceso | resolución server-side por request y estados activos | tests 403 y contexto vacío definido |
| TM-05 | secret/service-role en bundle/log | config separada, allowlist/redacción/scan | bundle + log canaries |
| TM-06 | XSS en nombres visibles | React text escaping; no HTML arbitrario; CSP | payload sintético renderizado como texto |
| TM-07 | SQL injection | schemas, allowlists y queries parametrizadas | inputs de code/name/filter maliciosos |
| TM-08 | redirect abierto Auth | redirect allowlist exacta por ambiente | URL externa rechazada |
| TM-09 | cache entrega contexto ajeno | private/no-store y ningún cache compartido por usuario | headers + test entre sesiones |
| TM-10 | enumeración de identidad | errores Auth genéricos/Problem Details | casos inexistente/deshabilitado indistinguibles públicamente |
| TM-11 | supply-chain/workflow comprometido | lockfile, action SHA, permisos mínimos, sin secrets en forks | CI canaries/review SPEC-207 |
| TM-12 | DB/proveedor caído causa bypass/retry storm | fail-closed, timeout, readiness, retry seguro | game day sintético SPEC-216 |
| TM-13 | correlation header malicioso | formato/longitud validada y reemplazo | test header inválido/oversized |
| TM-14 | preview altera schema compartido | sin migration credential/workflow en Preview | audit de variables/workflows |

## Matriz de datos I0

| Dato | Clase | Propósito | Browser | Persistencia/retención I0 |
| --- | --- | --- | --- | --- |
| access/refresh token | Restringida | sesión Auth | SDK/session boundary | según proveedor; nunca logs/Git |
| provider + subject | Confidencial | vincular User | no se expone | mientras User exista |
| displayName | Confidencial | UI | sí, del usuario autenticado | User sintético |
| email snapshot | Confidencial | contacto/provisioning | no en `/me/context` | opcional, sintético |
| Tenant id/name | Interna | contexto permitido | sólo memberships activas | seed sintético |
| Branch id/code/name/timezone | Interna | selección permitida | sólo scope efectivo | seed sintético |
| role id/code | Interna | explicar rol | sólo membership propia | assignment normalizado |
| permissions/entitlements completos | Interna | autorización | no en response I0 | calculados server-side |
| DB URLs/secrets | Restringida | runtime/migración | nunca | plataforma, rotación SPEC-214 |
| logs/traces | Interna | diagnóstico | sólo correlation ID público | retención mínima SPEC-216 |

No se recolectan CUIT, datos fiscales, huéspedes, empleados, reservas, pagos o archivos. Añadirlos requiere actualizar clasificación, propósito, retención, export/borrado y threat model.

## Security headers I0

Baseline sujeto a contract test sobre el deployment:

```text
Content-Security-Policy: default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; connect-src <allowlist>
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: no-store    # Auth/context responses
```

`connect-src` incluye sólo API y endpoints Auth realmente usados. `script-src`/`style-src` se mantienen restrictivos según el build aprobado; no se agrega `unsafe-eval`. HSTS se prueba en demo HTTPS, no local.

## Riesgo residual antes del spike

- patrón RLS/context propagation no demostrado: bloquea ADR-002;
- almacenamiento de sesión browser no validado: bloquea aceptación de SPK-03;
- configuración real CSP/CORS desconocida hasta preview;
- branch protection, owners y variables de plataforma no auditados;
- ASVS L2, legal, pentest y respuesta formal pendientes: bloquean datos reales/piloto.

# Contrato API — SPEC-023

## Límite

Supabase Auth u otro proveedor autentica; Maitre verifica token y resuelve User/Membership
autoritativos. El browser nunca recibe service-role, connection string ni claves privadas.

## Operaciones Maitre

| Operación | Contrato |
| --- | --- |
| `GET /v1/me` | perfil User mínimo autenticado |
| `GET /v1/me/context` | memberships/alcances seleccionables y contexto activo autorizado |
| `POST /v1/auth/context` | selecciona tenant/sucursal permitidos sin elevar claims |
| logout/reset/verify | delegados al provider mediante adapter y ownership documentado |

Login/refresh pueden ocurrir en SDK/provider, pero toda API verifica issuer, audience,
algoritmo permitido, firma/JWKS, expiry/not-before y subject. Fallas de JWKS/cache/rotation
fallan cerrado con retry acotado; nunca aceptan algoritmo o issuer del token sin allowlist.

## Resolución

`subject/provider → User → Membership ACTIVE → roles/permisos/alcances`. Tenant solicitado
de header/path debe pertenecer a la membership; no se toma de metadata editable. User o
membership disabled/revoked devuelve denegación aunque el JWT siga vigente.

## Sesión y seguridad

Cookies/tokens siguen protección CSRF/XSS según arquitectura elegida. Tokens no se loguean,
persisten en dominio ni aparecen en URLs. Rate limit y respuestas evitan enumeración. Auth
events/audit minimizan IP/user-agent y respetan retención.

## Errores y aceptación

`401` token ausente/inválido/vencido; `403` identidad válida sin contexto autorizado; `404`
para recursos cross-tenant posteriores. Tests cubren issuer/audience/alg, rotation, token
expirado, user sin membership, tenant B, revocación, provider outage y ausencia de secrets.

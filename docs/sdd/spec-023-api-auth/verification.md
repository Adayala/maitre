# Verificación — SPEC-023

## Criterios

### CAD-023-01 — Access token válido se verifica mediante issuer, audience, firma/JWKS, algoritmo allowlisted, exp/nbf y clock skew antes de crear `AuthenticatedPrincipal`

- [ ] bearer ausente o malformado devuelve 401 con `WWW-Authenticate`;
- [ ] firma, issuer, audience o algoritmo inválidos devuelven 401;
- [ ] token expirado o todavía no válido devuelve 401;
- [ ] fallo de obtención/rotación de JWKS falla cerrado.

### CAD-023-02 — El principal contiene identidad, no tenant/roles/alcances confiados; contexto se resuelve `subject/provider → User → Membership ACTIVE`

- [ ] un token válido produce un `AuthenticatedPrincipal` sin roles ni tenant confiados;
- [ ] claims falsos de rol, tenant o branch no amplían permisos;
- [ ] token válido sin User habilitado devuelve 403.

### CAD-023-03 — User/Membership suspendido o sucursal fuera de alcance se deniega aunque el JWT continúe criptográficamente vigente

- [ ] User o Membership suspendido no accede;
- [ ] una sucursal fuera del alcance efectivo devuelve 403;
- [ ] un usuario de Tenant A no observa recursos de Tenant B.

### CAD-023-04 — Login/refresh/logout/reset/verify pertenecen al provider/adaptador; Maitre no almacena passwords ni expone endpoints propios de login/refresh en I0

- [ ] login, refresh, logout, reset y verify se prueban contra el proveedor en entorno de test;
- [ ] Maitre no almacena passwords ni expone login/refresh propios en I0;
- [ ] logout limpia estado local y ejecuta revocación cuando aplique.

### CAD-023-05 — Tokens, reset codes, service-role keys y claims sensibles no aparecen en URL, logs, traces, artifacts ni bundle del browser

- [ ] no existen passwords, refresh tokens, access tokens completos o service-role keys en logs;
- [ ] el bundle React no contiene secretos server-side;
- [ ] redirects no allowlisted son rechazados;
- [ ] errores de cuenta no permiten enumeración.

### CAD-023-06 — Caída del provider/rotación JWKS falla cerrado y la suite contractual permite reemplazar el adapter sin cambiar dominio/casos de uso

- [ ] la misma suite contractual pasa para el adaptador real y un fake determinista;
- [ ] el reemplazo del proveedor no modifica casos de uso ni dominio;
- [ ] los checkboxes sólo se completan con enlaces a tests, resultados del spike, ADR aprobada y evidencia de configuración por ambiente.

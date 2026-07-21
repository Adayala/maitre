# Verificación — SPEC-023

## Contrato

- [ ] un token válido produce un `AuthenticatedPrincipal` sin roles ni tenant confiados;
- [ ] la misma suite contractual pasa para el adaptador real y un fake determinista;
- [ ] el reemplazo del proveedor no modifica casos de uso ni dominio.

## Casos negativos obligatorios

- [ ] bearer ausente o malformado devuelve 401 con `WWW-Authenticate`;
- [ ] firma, issuer, audience o algoritmo inválidos devuelven 401;
- [ ] token expirado o todavía no válido devuelve 401;
- [ ] fallo de obtención/rotación de JWKS falla cerrado;
- [ ] token válido sin User habilitado devuelve 403;
- [ ] User o Membership suspendido no accede;
- [ ] claims falsos de rol, tenant o branch no amplían permisos;
- [ ] un usuario de Tenant A no observa recursos de Tenant B;
- [ ] un branch fuera del scope efectivo devuelve 403.

## Flujos y seguridad

- [ ] login, refresh, logout, reset y verify se prueban contra el proveedor en entorno de test;
- [ ] redirects no allowlisted son rechazados;
- [ ] logout limpia el estado local y ejecuta revocación cuando aplique;
- [ ] no existen passwords, refresh tokens, access tokens completos o service-role keys en logs;
- [ ] el bundle React no contiene secretos server-side;
- [ ] errores de cuenta no permiten enumeración.

## Evidencia requerida

Los checkboxes sólo se completan con enlaces a tests, resultados del spike, ADR aprobada y evidencia de configuración por ambiente.

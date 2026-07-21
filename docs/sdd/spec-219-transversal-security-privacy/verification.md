# Verificación — SPEC-219

## Identidad y tenancy

- [ ] Tokens inválidos, vencidos o con issuer/audience incorrectos fallan cerrados.
- [ ] User inactivo o membership revocada pierde acceso efectivo.
- [ ] IDs/headers manipulados no cruzan tenant o branch.
- [ ] RLS y aplicación bloquean lectura/escritura cross-tenant.
- [ ] Listados, búsquedas, exports, eventos y storage respetan scope.

## Aplicación y browser

- [ ] CSP y headers se verifican en preview/demo.
- [ ] XSS, SQL injection, SSRF, redirect y path traversal poseen tests negativos.
- [ ] CSRF se prueba según mecanismo real de sesión.
- [ ] Rate/body/time limits degradan de forma segura.
- [ ] Archivos inválidos, activos o excesivos se rechazan.

## Datos y secretos

- [ ] Bundles, logs, traces, source maps y artefactos no exponen secretos.
- [ ] Demo/tests usan datos sintéticos.
- [ ] Backups/exports conservan protección y expiración.
- [ ] Datos restringidos tienen acceso y auditoría verificables.
- [ ] Rotación canaria demuestra revocación sin commit.

## Supply chain

- [ ] `npm ci` usa lockfile reproducible.
- [ ] SCA/SAST/Sonar/secret scan pasan o documentan excepción vigente.
- [ ] Workflows CI poseen permisos mínimos y referencias inmutables.
- [ ] Dependencia vulnerable explotable bloquea release según política.
- [ ] Artefacto desplegado se vincula con commit verificado.

## Gate

- [ ] Threat model y matriz de datos están actualizados.
- [ ] Requisitos ASVS aplicables poseen evidencia.
- [ ] No existen findings críticos/altos abiertos sin aceptación explícita.
- [ ] Respuesta a incidentes fue ejercitada.
- [ ] Revisión legal/contractual requerida está registrada.

# Verificación — SPEC-219

## Identidad y tenancy

- [ ] Tokens inválidos, vencidos o con issuer/audience incorrectos fallan cerrados.
- [ ] User inactivo o membership revocada pierde acceso efectivo.
- [ ] IDs/headers manipulados no cruzan tenant o branch.
- [ ] RLS y aplicación bloquean lectura/escritura cross-tenant.
- [ ] Listados, búsquedas, exports, eventos y storage respetan scope.

En I0, la última comprobación aplica sólo a superficies implementadas. Ausencia de endpoint/bucket se verifica; no se crea funcionalidad para probar un control futuro.

## Aplicación y browser

- [ ] CSP y headers se verifican en preview/demo.
- [ ] XSS, SQL injection y redirects del recorrido I0 poseen tests negativos; sinks ausentes de SSRF/path/upload permanecen ausentes.
- [ ] CSRF se prueba según mecanismo real de sesión.
- [ ] Rate/body/time limits degradan de forma segura.
- [ ] I0 no expone uploads ni buckets de producto.

## Datos y secretos

- [ ] Bundles, logs, traces, source maps y artefactos no exponen secretos.
- [ ] Demo/tests usan datos sintéticos.
- [ ] Backups/exports conservan protección y expiración.
- [ ] Datos restringidos tienen acceso y auditoría verificables.
- [ ] Rotación canaria demuestra revocación sin commit.
- [ ] Runtime funciona sin secret/service-role key y browser audit bloquea nombres prohibidos.

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
- [ ] El scaffold no afirma ASVS L2 ni aptitud para datos reales.

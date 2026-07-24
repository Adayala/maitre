# Verificación — SPEC-219

## Criterios

### CAD-219-01 — Trust boundaries, amenazas y datos sensibles se identifican antes de implementar

- [ ] threat model y matriz de datos están actualizados;
- [ ] la clasificación de datos se mantiene enlazada al diseño;
- [ ] los cambios relevantes actualizan su superficie de riesgo.

### CAD-219-02 — Identidad, tenant, branch, role y entitlement se validan server-side con deny-by-default

- [ ] tokens inválidos, vencidos o con issuer/audience incorrectos fallan cerrados;
- [ ] User inactivo o membership revocada pierde acceso efectivo;
- [ ] IDs/headers manipulados no cruzan tenant o branch;
- [ ] RLS y aplicación bloquean lectura/escritura cross-tenant;
- [ ] listados, búsquedas, exports, eventos y storage respetan scope.

### CAD-219-03 — Datos, secretos y artefactos siguen minimización, redacción y lifecycle explícito

- [ ] CSP y headers se verifican en preview/demo;
- [ ] XSS, SQL injection y redirects del recorrido I0 poseen tests negativos; sinks ausentes de SSRF/path/upload permanecen ausentes;
- [ ] CSRF se prueba según mecanismo real de sesión;
- [ ] rate/body/time limits degradan de forma segura;
- [ ] I0 no expone uploads ni buckets de producto;
- [ ] bundles, logs, traces, source maps y artefactos no exponen secretos;
- [ ] demo/tests usan datos sintéticos;
- [ ] backups/exports conservan protección y expiración;
- [ ] datos restringidos tienen acceso y auditoría verificables.

### CAD-219-04 — Supply chain y vulnerabilidades relevantes bloquean merge o release según política

- [ ] `npm ci` usa lockfile reproducible;
- [ ] SCA/SAST/Sonar/secret scan pasan o documentan excepción vigente;
- [ ] workflows CI poseen permisos mínimos y referencias inmutables;
- [ ] dependencia vulnerable explotable bloquea release según política;
- [ ] artefacto desplegado se vincula con commit verificado.

### CAD-219-05 — Sesiones, integraciones y credenciales tienen rotación, revocación y evidencias de uso seguro

- [ ] rotación canaria demuestra revocación sin commit;
- [ ] runtime funciona sin secret/service-role key y browser audit bloquea nombres prohibidos;
- [ ] las credenciales diferencian runtime, migración y otros usos sensibles.

### CAD-219-06 — Los gates de piloto exigen evidencia aplicable y no permiten promesas de cumplimiento no verificadas

- [ ] requisitos ASVS aplicables poseen evidencia;
- [ ] no existen findings críticos/altos abiertos sin aceptación explícita;
- [ ] respuesta a incidentes fue ejercitada;
- [ ] revisión legal/contractual requerida está registrada;
- [ ] el scaffold no afirma ASVS L2 ni aptitud para datos reales.

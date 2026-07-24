# Verificación — SPEC-213

## Criterios

### CAD-213-01 — El walking skeleton recorre navegador, API, persistencia e identidad reales

- [ ] `GET /health/live` responde sin acceder a dependencias;
- [ ] `GET /health/ready` responde `503` de forma sanitizada ante base inaccesible;
- [ ] migraciones levantan una base vacía sin pasos manuales;
- [ ] API funciona en Vercel y en proceso Node estándar.

### CAD-213-02 — El flujo contractual mínimo descubre contexto autorizado sin confiar en headers de selección

- [ ] `GET /v1/me/context` rechaza token ausente, inválido o vencido;
- [ ] una identidad sin User habilitado recibe el problema definido por SPEC-023;
- [ ] un User habilitado sin memberships activas recibe `200` y un array vacío;
- [ ] una membership activa devuelve sólo sus tenants y sucursales;
- [ ] `ALL_BRANCHES` y `SELECTED_BRANCHES` producen la lista efectiva esperada;
- [ ] enviar o modificar headers de contexto no altera `/v1/me/context` ni permite acceso cross-tenant;
- [ ] roles y branches poseen orden determinista y no provienen de claims del token.

### CAD-213-03 — El esqueleto valida decisiones de arquitectura antes de expandir dominios operativos

- [ ] `npm ci` funciona desde checkout limpio;
- [ ] `format:check`, lint, typecheck, tests y build pasan desde raíz;
- [ ] OpenAPI coincide con schemas ejecutables;
- [ ] el fixture contractual de `/v1/me/context` coincide con OpenAPI y el cliente generado;
- [ ] unit tests no necesitan red;
- [ ] tests de integración cubren RLS y aislamiento cross-tenant.

### CAD-213-04 — El recorrido comparte diseño, accesibilidad y observabilidad desde I0

- [ ] E2E completa login → contexto → Dash → logout;
- [ ] axe-core no reporta violaciones conocidas en el recorrido;
- [ ] el flujo funciona sólo con teclado y a 320 CSS px/zoom 200 %;
- [ ] logs permiten correlación y no contienen secretos.

### CAD-213-05 — La ejecución es portable entre local, preview y demo sin romper el free tier

- [ ] Sonar cumple el Quality Gate de código nuevo;
- [ ] consumo medido permanece dentro de SPEC-208;
- [ ] el mismo flujo es reproducible en local y ambiente demo aprobado.

### CAD-213-06 — La salida del skeleton deja evidencia ejecutable, no sólo intención documental

- [ ] existe URL del ambiente demo;
- [ ] existe ejecución CI vinculada al commit;
- [ ] existe reporte de tests, cobertura, Sonar y accesibilidad;
- [ ] existe OpenAPI generado;
- [ ] existe captura del flujo y resultados de verificación manual;
- [ ] existe runbook de despliegue, rollback y recuperación.

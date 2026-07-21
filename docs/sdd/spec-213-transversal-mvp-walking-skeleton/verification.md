# Verificación — SPEC-213

## Escenarios de contrato

- `GET /health/live` responde sin acceder a dependencias.
- `GET /health/ready` responde `503` de forma sanitizada ante base inaccesible.
- `GET /v1/me/context` rechaza token ausente, inválido o vencido.
- Una identidad sin User habilitado recibe el problema definido por SPEC-023.
- Un User habilitado sin memberships activas recibe `200` y un array vacío.
- Una membership activa devuelve sólo sus tenants y sucursales.
- `ALL_BRANCHES` y `SELECTED_BRANCHES` producen la lista efectiva esperada.
- Enviar o modificar headers de contexto no altera `/v1/me/context` ni permite acceso cross-tenant.
- Roles y branches poseen orden determinista y no provienen de claims del token.

## Gates técnicos

- [ ] `npm ci` funciona desde checkout limpio.
- [ ] Migraciones levantan una base vacía sin pasos manuales.
- [ ] `format:check`, lint, typecheck, tests y build pasan desde raíz.
- [ ] OpenAPI coincide con schemas ejecutables.
- [ ] El fixture contractual de `/v1/me/context` coincide con OpenAPI y el cliente generado.
- [ ] Unit tests no necesitan red.
- [ ] Tests de integración cubren RLS y aislamiento cross-tenant.
- [ ] E2E completa login → contexto → Dash → logout.
- [ ] axe-core no reporta violaciones conocidas en el recorrido.
- [ ] El flujo funciona sólo con teclado y a 320 CSS px/zoom 200 %.
- [ ] API funciona en Vercel y en proceso Node estándar.
- [ ] Logs permiten correlación y no contienen secretos.
- [ ] Sonar cumple el Quality Gate de código nuevo.
- [ ] Consumo medido permanece dentro de SPEC-208.

## Evidencia de salida

- URL del ambiente demo.
- ejecución CI vinculada al commit.
- reporte de tests, cobertura, Sonar y accesibilidad.
- OpenAPI generado.
- captura del flujo y resultados de verificación manual.
- runbook de despliegue, rollback y recuperación.

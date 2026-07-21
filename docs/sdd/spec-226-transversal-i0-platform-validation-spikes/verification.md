# Verificación — SPEC-226

## Reproducibilidad

- [ ] Otro checkout puede ejecutar comandos documentados.
- [ ] Versiones/configuración están registradas sin secretos.
- [ ] PASS incluye output, medición o test verificable.
- [ ] Recursos temporales y cleanup están inventariados.
- [ ] Cada registro conserva estado `NOT_RUN` hasta que exista evidencia.
- [ ] Owner y reviewer están identificados antes de ejecutar.

## Seguridad

- [ ] Tenant B y membership ausente reciben acceso denegado.
- [ ] Browser/artifacts no contienen service role/connection strings.
- [ ] Logs/errores no filtran tokens.
- [ ] Migration y runtime credentials tienen permisos distintos.
- [ ] El registro enumera variables requeridas sin copiar sus valores.

## Plataforma

- [ ] Vite/Fastify funcionan en Vercel y local Node.
- [ ] Pooling soporta concurrencia demo sin agotamiento.
- [ ] Auth/JWKS falla cerrado.
- [ ] Migrations/RLS se reproducen desde Git.
- [ ] CI/toolchain cumple gates y presupuesto medido.
- [ ] Dump/restore/export recupera datos sintéticos.

## Presupuesto

- [ ] Cada ejecución remota registra plan/cuota y consumo inicial/final.
- [ ] No existe billing, upgrade o add-on activado por el spike.
- [ ] PASS incluye margen demo y stop conditions observables.
- [ ] Límite gratuito alcanzado se reporta como resultado, no se evita comprando capacidad.

## Decisión

- [ ] Cada criterio ADR-002/003 tiene evidencia.
- [ ] Inconclusive/fail no se presenta como aceptación.
- [ ] ADRs y readiness se actualizan con resultado.
- [ ] Código experimental tiene destino explícito: eliminar, archivar o reescribir.

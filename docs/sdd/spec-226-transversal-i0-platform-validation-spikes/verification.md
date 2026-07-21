# Verificación — SPEC-226

## Reproducibilidad

- [ ] Otro checkout puede ejecutar comandos documentados.
- [ ] Versiones/configuración están registradas sin secretos.
- [ ] PASS incluye output, medición o test verificable.
- [ ] Recursos temporales y cleanup están inventariados.

## Seguridad

- [ ] Tenant B y membership ausente reciben acceso denegado.
- [ ] Browser/artifacts no contienen service role/connection strings.
- [ ] Logs/errores no filtran tokens.
- [ ] Migration y runtime credentials tienen permisos distintos.

## Plataforma

- [ ] Vite/Fastify funcionan en Vercel y local Node.
- [ ] Pooling soporta concurrencia demo sin agotamiento.
- [ ] Auth/JWKS falla cerrado.
- [ ] Migrations/RLS se reproducen desde Git.
- [ ] CI/toolchain cumple gates y presupuesto medido.
- [ ] Dump/restore/export recupera datos sintéticos.

## Decisión

- [ ] Cada criterio ADR-002/003 tiene evidencia.
- [ ] Inconclusive/fail no se presenta como aceptación.
- [ ] ADRs y readiness se actualizan con resultado.
- [ ] Código experimental tiene destino explícito: eliminar, archivar o reescribir.

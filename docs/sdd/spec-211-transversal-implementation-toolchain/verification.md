# Verificación — SPEC-211

## Criterios

### CAD-211-01 — El toolchain es gratuito, mantenible y compatible con npm workspaces

- [ ] `npm ci` reproduce el entorno desde un checkout limpio;
- [ ] el toolchain completo funciona dentro de la cuota CI de SPEC-208;
- [ ] la instalación y operación respetan el perímetro gratuito del MVP.

### CAD-211-02 — Web y API comparten contratos tipados sin acoplar el dominio a frameworks

- [ ] Zod rechaza requests inválidos antes del caso de uso;
- [ ] OpenAPI se genera desde contratos y CI detecta drift;
- [ ] los contratos tipados compartidos conservan una única fuente ejecutable.

### CAD-211-03 — La web es portable y la API corre igual en Vercel y Node estándar

- [ ] Vite genera `dist` y puede servirse sin Vercel;
- [ ] la SPA funciona en preview Vercel con fallback de rutas correcto;
- [ ] Fastify responde health en Vercel y Node estándar usando la misma app.

### CAD-211-04 — PostgreSQL, migraciones y RLS siguen siendo explícitos, versionados y revisables

- [ ] SPK-02 demuestra la configuración de Supavisor/Drizzle y documenta prepared statements;
- [ ] migraciones crean el schema desde cero y `drizzle-kit check` pasa;
- [ ] RLS/grants aparecen en SQL versionado.

### CAD-211-05 — Tests, lint y análisis de boundaries son rápidos, locales y equivalentes a CI

- [ ] unit tests corren sin servicios externos;
- [ ] integration tests prueban persistence y rutas;
- [ ] Playwright completa el recorrido mínimo en Chromium;
- [ ] ESLint bloquea una promesa flotante y un import arquitectónico inválido;
- [ ] dependency-cruiser bloquea un ciclo;
- [ ] Sonar recibe cobertura y aprueba SPEC-207.

### CAD-211-06 — ADR-003 sólo puede aceptarse con evidencia PASS de los spikes requeridos

- [ ] ADR-003 enlaza evidencia PASS;
- [ ] ningún resultado `NOT_RUN`/inconclusive se presenta como adopción;
- [ ] la adopción final queda respaldada por evidencia ejecutable.

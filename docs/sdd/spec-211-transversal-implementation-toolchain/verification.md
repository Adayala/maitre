# VERIFICATION — SPEC-211

- [ ] `npm ci` reproduce el entorno desde un checkout limpio.
- [ ] Vite genera `dist` y puede servirse sin Vercel.
- [ ] La SPA funciona en preview Vercel con fallback de rutas correcto.
- [ ] Fastify responde health en Vercel y Node estándar usando la misma app.
- [ ] Zod rechaza requests inválidos antes del caso de uso.
- [ ] OpenAPI se genera desde contratos y CI detecta drift.
- [ ] Drizzle conecta a Supabase mediante Supavisor con `prepare: false`.
- [ ] Migraciones crean el schema desde cero y `drizzle-kit check` pasa.
- [ ] RLS/grants aparecen en SQL versionado.
- [ ] Unit tests corren sin servicios externos.
- [ ] Integration tests prueban persistence y rutas.
- [ ] Playwright completa el recorrido mínimo en Chromium.
- [ ] ESLint bloquea una promesa flotante y un import arquitectónico inválido.
- [ ] dependency-cruiser bloquea un ciclo.
- [ ] Sonar recibe cobertura y aprueba SPEC-207.
- [ ] El toolchain completo funciona dentro de la cuota CI de SPEC-208.

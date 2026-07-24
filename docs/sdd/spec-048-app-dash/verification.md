# Verificación — SPEC-048

## Criterios

### CAD-048-01 — La app consume APIs/versiones aprobadas y nunca accede DB ni decide autorización, readiness o métricas por lógica cliente

- [ ] la app consume sólo APIs/versiones aprobadas;
- [ ] no accede DB directamente;
- [ ] no decide autorización, readiness o métricas por lógica cliente.

### CAD-048-02 — Setup renderiza item codes/status/reasons/actions del backend y no persiste “completado” por click

- [ ] setup representa items/reasons/actions sin estado cliente autoritativo;
- [ ] no persiste “completado” por click;
- [ ] renderiza exactamente las señales derivadas del backend.

### CAD-048-03 — Overview representa AVAILABLE/PARTIAL/UNAVAILABLE, asOf/freshness y retry sin convertir missing/error en cero

- [ ] overview representa partial/stale/unavailable sin fabricar ceros;
- [ ] asOf/freshness y retry siguen contrato;
- [ ] missing/error no se convierte en cero.

### CAD-048-04 — Loading/empty/error/forbidden/not-found/stale poseen UX no enumerable y mantienen layout/focus

- [ ] forbidden/not-found no permiten enumeración;
- [ ] loading/empty/error/retry preservan layout/focus;
- [ ] stale posee UX explícita y no enumerable.

### CAD-048-05 — Navegación teclado, landmarks, contraste WCAG 2.2 AA, focus y touch targets se verifican en rutas críticas/responsive

- [ ] journeys críticos cumplen teclado, landmarks, contraste y touch targets;
- [ ] viewports móviles/desktop no pierden contenido/acción;
- [ ] focus management y responsive siguen contrato.

### CAD-048-06 — Tokens/secrets/PII no aparecen en URL/logs/analytics/bundle; cache offline, si existe, es read-only y stale explícita

- [ ] tokens/secrets/PII no aparecen en URL/storage/logs/analytics/bundle;
- [ ] build/tests funcionan fuera del hosting inicial;
- [ ] cache offline, si existe, es read-only y stale explícita.

# Verificación — SPEC-221

## Criterios

### CAD-221-01 — CI entrega feedback rápido, determinista y bloquea cambios inválidos antes del merge

- [x] checkout limpio reproduce instalación, tests y build;
- [ ] commit inválido y secret canario bloquean pipeline;
- [x] cambio breaking OpenAPI no aprobado falla;
- [ ] violación arquitectónica, RLS o Sonar bloquea merge;
- [x] run obsoleto se cancela por workflow/ref sin cancelar otra rama;
- [x] detector de impacto tiene tests y usa fallback completo para rutas compartidas/desconocidas;
- [x] `E2E gate` agrega matrices selectivas y el journey release sin quedar pending en docs-only;
- [ ] workflows declaran permisos mínimos y third-party actions están fijadas por SHA.

Evidencia operativa actual:
[cierre de gaps del MVP](../../operations/mvp-gap-closure-2026-07-30.md) y workflow `End-to-end`.
Las actions están fijadas por versión mayor, no por SHA; ese criterio continúa abierto.

### CAD-221-02 — Previews y ambientes compartidos usan secretos, datos y permisos mínimos autorizados

- [ ] preview usa sólo datos/secretos autorizados;
- [ ] preview vencida se elimina sin afectar datos compartidos;
- [ ] commit de cada contributor autorizado despliega o el blocker Hobby queda documentado.

### CAD-221-03 — El mismo commit probado se promueve sin rebuild ambiguo entre ambientes

- [ ] `main` construye un Production deployment staged con `APP_ENV=demo`;
- [ ] demo promueve el mismo staged deployment sin rebuild;
- [ ] metadata permite identificar commit/config/migración;
- [ ] health, smoke, synthetic y observabilidad verifican release.

### CAD-221-04 — Las migraciones siguen una estrategia compatible con despliegue, rollback y forward-only controlado

- [ ] base vacía y schema anterior migran correctamente;
- [ ] versión anterior de app funciona después de expand;
- [ ] backfill es reanudable, observable e idempotente;
- [ ] contract ocurre después de cerrar ventana de rollback;
- [ ] cambio destructivo posee backup/restore y aprobación;
- [ ] preview/build/runtime no ejecutan migraciones y carecen de migration credential.

### CAD-221-05 — Rollback de aplicación, configuración y datos se distingue y se ejercita con evidencia

- [ ] artefacto anterior se despliega sin rebuild ambiguo;
- [ ] config se revierte a versión compatible;
- [ ] datos/objetos se compensan o restauran por runbook;
- [ ] efectos externos se reconcilian, no se repiten;
- [ ] ejercicio registra tiempo, fallos y acciones.

### CAD-221-06 — Production permanece bloqueado hasta cumplir gates comerciales, operativos y de seguridad

- [ ] production no está conectado a un pipeline automático prematuro;
- [ ] readiness comercial, ASVS, DR, on-call, SLO y costos están aprobados antes de habilitarlo.

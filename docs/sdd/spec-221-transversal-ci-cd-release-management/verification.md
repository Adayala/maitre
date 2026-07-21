# Verificación — SPEC-221

## CI

- [ ] Checkout limpio reproduce instalación, tests y build.
- [ ] Commit inválido y secret canario bloquean pipeline.
- [ ] Cambio breaking OpenAPI no aprobado falla.
- [ ] Violación arquitectónica, RLS o Sonar bloquea merge.
- [ ] Run obsoleto se cancela sin cancelar otra rama.
- [ ] Path filtering nunca produce un gate requerido ausente.

## Deploy y promoción

- [ ] Preview usa sólo datos/secretos autorizados.
- [ ] Development despliega exactamente el SHA verde de `main`.
- [ ] Demo promueve el mismo commit/artefacto aprobado.
- [ ] Health, smoke, synthetic y observabilidad verifican release.
- [ ] Metadata permite identificar commit/config/migración.
- [ ] Preview vencida se elimina sin afectar datos compartidos.

## Migraciones

- [ ] Base vacía y schema anterior migran correctamente.
- [ ] Versión anterior de app funciona después de expand.
- [ ] Backfill es reanudable, observable e idempotente.
- [ ] Contract ocurre después de cerrar ventana de rollback.
- [ ] Cambio destructivo posee backup/restore y aprobación.

## Rollback

- [ ] Artefacto anterior se despliega sin rebuild ambiguo.
- [ ] Config se revierte a versión compatible.
- [ ] Datos/objetos se compensan o restauran por runbook.
- [ ] Efectos externos se reconcilian, no se repiten.
- [ ] Ejercicio registra tiempo, fallos y acciones.

## Gate productivo

- [ ] Production no está conectado a un pipeline automático prematuro.
- [ ] Readiness comercial, ASVS, DR, on-call, SLO y costos están aprobados antes de habilitarlo.

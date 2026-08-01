# Tareas — SPEC-221

- [ ] Aprobar ramas, commits, promoción y release policy.
- [ ] Auditar visibilidad/plan GitHub y disponibilidad de branch protection.
- [ ] Auditar owner/commit authors permitidos por Vercel Hobby.
- [ ] Proteger `main` con checks requeridos.
- [ ] Configurar validación de Conventional Commits.
- [x] Crear workflows de Quality, CodeQL, E2E y deploy con permisos mínimos.
- [x] Configurar concurrency y cache segura.
- [x] Implementar selección conservadora de E2E/deploy por archivos afectados.
- [x] Agregar tests unitarios del detector de impacto.
- [x] Desplegar desde `main` sólo después de Quality y E2E exitosos.
- [x] Habilitar redespliegue completo mediante `workflow_dispatch`.
- [x] Crear check agregador para path filtering.
- [x] Publicar reports y metadata por SHA.
- [ ] Desplegar previews con datos sintéticos.
- [ ] Separar el deploy vigente desde `main` de una promoción staged sin rebuild con
      `APP_ENV=demo`.
- [ ] Configurar smoke, aprobación y promoción staged sin rebuild.
- [ ] Crear migration job separado del runtime.
- [ ] Probar expand/migrate/contract.
- [ ] Crear smoke, synthetic y observación post-deploy.
- [ ] Automatizar limpieza de previews.
- [ ] Crear template y runbook de release/rollback.
- [ ] Ensayar rollback de app/config y reconciliación de datos.
- [ ] Integrar gates de seguridad, SLO, cuota y DR.
- [ ] Medir métricas de entrega y revisar cuellos de botella.
- [ ] Probar PR de fork/no confiable sin exposición de secrets.
- [ ] Verificar que Preview no dispone de `DATABASE_MIGRATION_URL`.

El gate agregado vigente se llama `E2E gate`. La evidencia de Quality, Playwright y MVP-J-001 se
publica por run/attempt y conserva el SHA en metadata del workflow. Existen probes de health
post-deploy y un synthetic durable pre-deploy; la tarea combinada de smoke/synthetic/observación
post-deploy permanece abierta hasta operar telemetría remota.

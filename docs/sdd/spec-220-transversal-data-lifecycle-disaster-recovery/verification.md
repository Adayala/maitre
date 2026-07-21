# Verificación — SPEC-220

## Backup

- [ ] Dump temporal usa credencial dedicada y no filtra secretos.
- [ ] Manifest identifica ambiente/schema/herramienta/hash.
- [ ] Cifrado ocurre antes de almacenamiento externo.
- [ ] Restore ocurre fuera del proyecto origen y demuestra portabilidad.
- [ ] Artefacto/key temporal se elimina al finalizar el ejercicio.

## Restore

- [ ] Destino limpio se recupera siguiendo sólo el runbook.
- [ ] Migraciones, grants y RLS coinciden con Git.
- [ ] Checks de integridad y conteos críticos pasan.
- [ ] Storage permanece deshabilitado o fixtures temporales coinciden con manifest/ownership.
- [ ] Identidades/memberships no amplían permisos.
- [ ] Smoke/E2E del walking skeleton pasa sin proveedores reales.

## Seguridad y ciclo de vida

- [ ] Backup real no llega a demo/development.
- [ ] Acceso y restore quedan auditados.
- [ ] Keys/secretos comprometidos no se reutilizan.
- [ ] Tombstones reaplican borrados tras restore.
- [ ] No quedan dumps I0 en Git, CI artifacts, chat o disco personal no autorizado.
- [ ] Legal hold afecta sólo su alcance autorizado.

## Objetivos

- [ ] RPO real se calcula desde datos recuperados, no desde hora del job.
- [ ] RTO incluye provisionamiento, restore, verificación y reapertura.
- [ ] SPK-06 registra RPO/RTO observado sin llamarlo objetivo aprobado.
- [ ] Si aparece dato no regenerable, el gate bloquea hasta aprobar frecuencia/destino.
- [ ] Production continúa bloqueado hasta aprobar continuidad completa.

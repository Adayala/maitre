# Verificación — SPEC-220

## Backup

- [ ] Dump usa credencial mínima y no filtra secretos.
- [ ] Manifest identifica ambiente/schema/herramienta/hash.
- [ ] Cifrado ocurre antes de almacenamiento externo.
- [ ] Copia externa sobrevive pérdida del proveedor/cuenta origen simulada.
- [ ] Retención no elimina la última copia válida.

## Restore

- [ ] Destino limpio se recupera siguiendo sólo el runbook.
- [ ] Migraciones, grants y RLS coinciden con Git.
- [ ] Checks de integridad y conteos críticos pasan.
- [ ] Objetos coinciden con manifest y ownership.
- [ ] Identidades/memberships no amplían permisos.
- [ ] Smoke/E2E del walking skeleton pasa sin proveedores reales.

## Seguridad y ciclo de vida

- [ ] Backup real no llega a demo/development.
- [ ] Acceso y restore quedan auditados.
- [ ] Keys/secretos comprometidos no se reutilizan.
- [ ] Tombstones reaplican borrados tras restore.
- [ ] Copias vencidas se purgan con evidencia.
- [ ] Legal hold afecta sólo su alcance autorizado.

## Objetivos

- [ ] RPO real se calcula desde datos recuperados, no desde hora del job.
- [ ] RTO incluye provisionamiento, restore, verificación y reapertura.
- [ ] Demo cumple objetivos aprobados o genera acción/upgrade.
- [ ] Último restore exitoso está dentro de la frecuencia definida.
- [ ] Production continúa bloqueado hasta aprobar continuidad completa.

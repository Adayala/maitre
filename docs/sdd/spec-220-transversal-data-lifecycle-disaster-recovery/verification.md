# Verificación — SPEC-220

## Criterios

### CAD-220-01 — Existe inventario completo de activos recuperables, dependencias y objetivos RPO/RTO por ambiente

- [ ] RPO real se calcula desde datos recuperados, no desde hora del job;
- [ ] RTO incluye provisionamiento, restore, verificación y reapertura;
- [ ] SPK-06 registra RPO/RTO observado sin llamarlo objetivo aprobado.

### CAD-220-02 — Un backup sólo es válido si puede restaurarse de forma verificable fuera del failure domain original

- [ ] dump temporal usa credencial dedicada y no filtra secretos;
- [ ] manifest identifica ambiente/schema/herramienta/hash;
- [ ] cifrado ocurre antes de almacenamiento externo;
- [ ] restore ocurre fuera del proyecto origen y demuestra portabilidad;
- [ ] artefacto/key temporal se elimina al finalizar el ejercicio.

### CAD-220-03 — PostgreSQL, identidad, objetos, configuración y secretos se recuperan por procedimientos coordinados pero separados

- [ ] destino limpio se recupera siguiendo sólo el runbook;
- [ ] migraciones, grants y RLS coinciden con Git;
- [ ] checks de integridad y conteos críticos pasan;
- [ ] storage permanece deshabilitado o fixtures temporales coinciden con manifest/ownership;
- [ ] identidades/memberships no amplían permisos;
- [ ] smoke/E2E del walking skeleton pasa sin proveedores reales.

### CAD-220-04 — Retención, legal hold, borrado y anonimización siguen categorías y obligaciones explícitas

- [ ] backup real no llega a demo/development;
- [ ] acceso y restore quedan auditados;
- [ ] keys/secretos comprometidos no se reutilizan;
- [ ] tombstones reaplican borrados tras restore;
- [ ] legal hold afecta sólo su alcance autorizado.

### CAD-220-05 — La portabilidad y salida de proveedor son ejercitables antes de guardar datos no regenerables

- [ ] no quedan dumps I0 en Git, CI artifacts, chat o disco personal no autorizado;
- [ ] la portabilidad queda demostrada con restore fuera del proyecto origen;
- [ ] el gate de salida conserva evidencia reproducible.

### CAD-220-06 — El perímetro MVP bloquea continuidad o retención impropias mientras no exista plataforma aprobada

- [ ] si aparece dato no regenerable, el gate bloquea hasta aprobar frecuencia/destino;
- [ ] production continúa bloqueado hasta aprobar continuidad completa;
- [ ] el perímetro MVP no promete continuidad impropia.

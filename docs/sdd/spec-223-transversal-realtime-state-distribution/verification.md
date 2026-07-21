# Verificación — SPEC-223

## Consistencia

- [ ] Hint perdido converge mediante polling/refetch.
- [ ] Duplicate/stale no revierte estado.
- [ ] Gap dispara fetch autoritativo.
- [ ] Reconexión recupera estado aunque replay no esté disponible.
- [ ] Comando rechazado no aparece confirmado por hint.

## Seguridad

- [ ] Otro tenant/branch/station no puede leer topic/proyección.
- [ ] Revocar membership cierra o invalida acceso.
- [ ] Browser no contiene service role ni payloads crudos sensibles.
- [ ] Topics/logs no exponen PII.
- [ ] Public channels están deshabilitados para operación.

## Rendimiento y UX

- [ ] p95 command → visible cumple objetivo aprobado.
- [ ] Polls sin cambios usan 304/delta y no se solapan.
- [ ] Background/offline reduce actividad.
- [ ] Staleness visible no roba foco ni genera toast storm.
- [ ] Cambio de contexto cancela requests/subscriptions anteriores.

## Portabilidad y fallback

- [ ] Apps funcionan con polling sin proveedor realtime.
- [ ] Push, si existe, puede deshabilitarse por configuración.
- [ ] Caída del transporte activa fallback y mantiene convergencia.
- [ ] Volumen/cuota medidos soportan el escenario demo/piloto.

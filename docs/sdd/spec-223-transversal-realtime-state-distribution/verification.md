# Verificación — SPEC-223

## Criterios

### CAD-223-01 — La distribución realtime propaga hints operativos con latencia útil sin convertirse en autoridad

- [ ] p95 command → visible cumple objetivo aprobado;
- [ ] comando rechazado no aparece confirmado por hint;
- [ ] los hints no sustituyen el estado autoritativo.

### CAD-223-02 — La consistencia se recupera por refetch, replay o fallback cuando se pierden mensajes

- [ ] hint perdido converge mediante polling/refetch;
- [ ] duplicate/stale no revierte estado;
- [ ] gap dispara fetch autoritativo;
- [ ] reconexión recupera estado aunque replay no esté disponible.

### CAD-223-03 — Tenant, sucursal, role y station acotan streams y topics con seguridad verificable

- [ ] otro tenant/sucursal/station no puede leer topic/proyección;
- [ ] revocar membership cierra o invalida acceso;
- [ ] browser no contiene service role ni payloads crudos sensibles;
- [ ] topics/logs no exponen PII;
- [ ] public channels están deshabilitados para operación.

### CAD-223-04 — La UX hace visible desactualización, reconexión y fallback sin fabricar confirmaciones falsas

- [ ] polls sin cambios usan 304/delta y no se solapan;
- [ ] background/offline reduce actividad;
- [ ] la desactualización visible no roba foco ni genera toast storm;
- [ ] cambio de contexto cancela requests/subscriptions anteriores.

### CAD-223-05 — El volumen, conexiones y costo se miden dentro del presupuesto del MVP

- [ ] volumen/cuota medidos soportan el escenario demo/piloto;
- [ ] la estrategia realtime degrada dentro del presupuesto aprobado;
- [ ] las conexiones no se asumen ilimitadas.

### CAD-223-06 — La implementación conserva portabilidad a otro transporte sin reescribir casos de uso o modelos de UI

- [ ] apps funcionan con polling sin proveedor realtime;
- [ ] push, si existe, puede deshabilitarse por configuración;
- [ ] caída del transporte activa fallback y mantiene convergencia.

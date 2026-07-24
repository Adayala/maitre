# Verificación — SPEC-218

## Criterios

### CAD-218-01 — Offline es explícito por comando y preserva durabilidad local verificable

- [ ] reload/crash conserva comandos y estado visible;
- [ ] migración local preserva journal o bloquea recuperablemente;
- [ ] storage pressure no elimina trabajo pendiente.

### CAD-218-02 — La sincronización usa journal durable, idempotencia server-side y resultados por comando

- [ ] reintentos repetidos producen un único efecto;
- [ ] batch parcial conserva resultados por comando;
- [ ] comandos de un agregado mantienen dependencia causal;
- [ ] cursor inválido dispara bootstrap/reset seguro.

### CAD-218-03 — Los conflictos se resuelven por reglas de dominio, nunca por last-write-wins universal

- [ ] dos dispositivos convergen o producen conflicto explícito;
- [ ] cambio remoto de precio/alérgeno no se acepta silenciosamente;
- [ ] cierre remoto bloquea mutaciones dependientes;
- [ ] estado Kitchen inválido se rechaza sin perder evidencia;
- [ ] resolución manual conserva historial y actor.

### CAD-218-04 — El usuario ve degradación, pending work y límites operativos con claridad

- [ ] Guest no recibe confirmación antes del ACK;
- [ ] indicador muestra estado, última sync y pendientes;
- [ ] flujo funciona con teclado, touch y conectividad intermitente.

### CAD-218-05 — Hay límites claros entre funciones offline permitidas, read-only y bloqueadas

- [ ] expiración offline bloquea nuevas mutaciones y preserva journal;
- [ ] funciones online-only permanecen bloqueadas fuera de red;
- [ ] la app no amplía autoridad por operar offline.

### CAD-218-06 — La sincronización conserva aislamiento, seguridad y portabilidad entre dispositivos y versiones

- [ ] cambio de tenant/user no expone datos previos;
- [ ] logout/cambio de sucursal protege trabajo pendiente;
- [ ] no existen secretos, passwords o service role en storage/cache;
- [ ] cortar red antes, durante y después del push produce outcomes controlados;
- [ ] cerrar pestaña durante escritura y durante ACK preserva comportamiento recuperable;
- [ ] alternar offline/online rápidamente, cambiar estado del mismo agregado desde dos dispositivos, desplegar nueva versión con comandos viejos pendientes y agotar cuota local de forma controlada producen evidencia verificable.

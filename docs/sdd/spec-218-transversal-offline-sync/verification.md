# Verificación — SPEC-218

## Durabilidad local

- [ ] Reload/crash conserva comandos y estado visible.
- [ ] Migración local preserva journal o bloquea recuperablemente.
- [ ] Storage pressure no elimina trabajo pendiente.
- [ ] Cambio de tenant/user no expone datos previos.

## Idempotencia y convergencia

- [ ] Reintentos repetidos producen un único efecto.
- [ ] Batch parcial conserva resultados por comando.
- [ ] Comandos de un agregado mantienen dependencia causal.
- [ ] Dos dispositivos convergen o producen conflicto explícito.
- [ ] Cursor inválido dispara bootstrap/reset seguro.

## Conflictos

- [ ] Cambio remoto de precio/alérgeno no se acepta silenciosamente.
- [ ] Cierre remoto bloquea mutaciones dependientes.
- [ ] Estado Kitchen inválido se rechaza sin perder evidencia.
- [ ] Resolución manual conserva historial y actor.

## UX y seguridad

- [ ] Guest no recibe confirmación antes del ACK.
- [ ] Indicador muestra estado, última sync y pendientes.
- [ ] Logout/cambio de sucursal protege trabajo pendiente.
- [ ] Expiración offline bloquea nuevas mutaciones y preserva journal.
- [ ] No existen secretos, passwords o service role en storage/cache.
- [ ] Flujo funciona con teclado, touch y conectividad intermitente.

## Prueba de caos mínima

- cortar red antes, durante y después del push;
- cerrar pestaña durante escritura y durante ACK;
- alternar offline/online rápidamente;
- cambiar estado del mismo agregado desde dos dispositivos;
- desplegar nueva versión con comandos viejos pendientes;
- agotar cuota local de forma controlada.

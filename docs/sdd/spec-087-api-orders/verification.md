# Verificación — SPEC-087

## Criterios

### CAD-087-01 — La API define rutas, comandos y alcances con autoridad inequívoca

- [ ] rutas y alcances create/list/detail/submit/cancel son inequívocos.

### CAD-087-02 — Create y submit usan idempotencia; mutaciones versionadas usan revisión

- [ ] idempotencia y expected revision cubren retries y lost updates.

### CAD-087-03 — El servidor conserva autoridad sobre importes y snapshots

- [ ] importes del cliente no adquieren autoridad y el servidor recalcula snapshot.

### CAD-087-04 — Los conflictos devuelven contratos de error estables

- [ ] `409`, `412`, `422`, `404` y conflictos idempotentes siguen contrato estable.

### CAD-087-05 — Submit coordina Order, KitchenTicket y outbox con atomicidad

- [ ] submit conserva atomicidad con KitchenTicket y outbox.

### CAD-087-06 — La aprobación exige evidencia de retry, catálogo y concurrencia

- [ ] fixtures cubren catálogo cambiado, cancelación, carreras y aislamiento.

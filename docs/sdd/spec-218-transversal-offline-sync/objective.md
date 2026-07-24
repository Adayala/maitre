# Objetivo — SPEC-218

Mantener la continuidad operativa esencial de salón y cocina durante cortes breves sin presentar estados inciertos como confirmados, perder acciones o vulnerar aislamiento y permisos.

## Resultados esperados

- Operación degradada visible y comprensible.
- Acciones locales durables ante reload o cierre inesperado.
- Reintentos sin efectos duplicados.
- Conflictos detectados y resueltos según el dominio.
- Recuperación después de horas offline o múltiples dispositivos.
- Límite claro entre funciones permitidas, read-only y bloqueadas.

## Fuera de alcance

- Servidor local en la sucursal durante el MVP.
- Operación offline ilimitada o sin autenticación previa.
- Sincronización peer-to-peer entre dispositivos.
- Confirmar pagos, comprobantes fiscales o pedidos Guest sin servidor.
- Replicar toda la base en el navegador.

## Criterios de aceptación

### CAD-218-01 — Offline es explícito por comando y preserva durabilidad local verificable

Cada capacidad offline se declara por comando o flujo, no como propiedad global de la app. El trabajo local pendiente sobrevive a reloads, cierres y cortes breves de red.

### CAD-218-02 — La sincronización usa journal durable, idempotencia server-side y resultados por comando

Push y pull usan identidades explícitas, journal durable y resultados deterministas por comando. Los reintentos no pueden duplicar efectos ni ocultar fallos parciales.

### CAD-218-03 — Los conflictos se resuelven por reglas de dominio, nunca por last-write-wins universal

Cambios simultáneos o remotos incompatibles generan convergencia explícita o conflicto visible. La resolución conserva actor, historia y evidencia suficiente.

### CAD-218-04 — El usuario ve degradación, pending work y límites operativos con claridad

La UX distingue online, offline, pending, synced, stale y blocked. El sistema no presenta acciones locales como confirmadas por servidor antes del ACK correspondiente.

### CAD-218-05 — Hay límites claros entre funciones offline permitidas, read-only y bloqueadas

Pagos, caja, fiscalidad, permisos y configuración sensible permanecen online-only durante el MVP. La operación offline no replica toda la base ni amplía autoridad.

### CAD-218-06 — La sincronización conserva aislamiento, seguridad y portabilidad entre dispositivos y versiones

Logout, cambio de tenant o expiración protegen datos locales, y las migraciones del store local no pierden trabajo sin recuperación. El diseño sigue siendo portable y no depende de un mecanismo peer-to-peer o proveedor único.

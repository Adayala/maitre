# Objetivo — SPEC-223

Propagar cambios operativos con latencia suficiente para el servicio gastronómico, manteniendo consistencia, autorización, recuperación y portabilidad dentro del presupuesto inicial.

## Resultados esperados

- Kitchen ve pedidos nuevos y Floor ve ítems listos sin refresh manual.
- Un mensaje perdido no produce divergencia permanente.
- Clientes reconectados recuperan gaps desde estado autoritativo.
- Tenant, branch, role y station limitan cada stream/update.
- Frecuencia, conexiones y volumen se miden contra free tier.
- El transporte puede migrar sin cambiar casos de uso o modelos de UI.

## Fuera de alcance

- Garantizar exactly-once por WebSocket.
- Usar presencia como fuente de verdad de usuarios/turnos.
- Exponer Postgres Changes directamente como contrato de producto.
- Reemplazar outbox, APIs o sincronización offline.

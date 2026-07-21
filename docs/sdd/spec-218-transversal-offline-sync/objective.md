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

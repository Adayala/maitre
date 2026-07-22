# Especificación — SPEC-091 Order Tracking API

Devuelve Order y allocations por item con estado, timestamps confirmados, aggregate revision,
projection cursor y `asOf`. La proyección converge por event ID/revision y no retrocede estados
terminales ante eventos tardíos.

Acceso público exige capability `ORDER_TRACK_READ`, hasheada y separada de otras capabilities;
omite precios, Guest, notas e instrucciones internas. Acceso interno exige permiso y branch scope.
La API declara consistencia eventual y nunca sirve como precondición de un comando.

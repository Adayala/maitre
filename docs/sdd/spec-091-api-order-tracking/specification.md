# Especificación — SPEC-091

Devuelve `Order` y allocations por item con estado, timestamps confirmados, revisión agregada,
cursor de proyección y `asOf`. La proyección converge por `eventId`/revisión y no retrocede estados
terminales ante eventos tardíos.

Acceso público exige capability `ORDER_TRACK_READ`, hasheada y separada de otras capabilities;
omite precios, Guest, notas e instrucciones internas. Acceso interno exige permiso y alcance por sucursal.
La API declara consistencia eventual y nunca sirve como precondición de un comando.

La superficie incluye al menos un detail público por token y un detail interno por `orderId`; ambos
devuelven el mismo modelo lógico con distinta redacción según audiencia. El payload contiene
`orderId` o alias público permitido, estado derivado de `Order`, estado por item/allocation,
timestamps confirmados por servidor, `aggregateRevision`, `projectionCursor`, `asOf` y reason codes
operativos permitidos.

La proyección se reconstruye desde eventos autoritativos de `Order` y `KitchenTicket`. Si recibe eventos
repetidos o desordenados, converge aplicando `eventId`, `aggregateRevision` y reglas monotónicas;
no marca un item como menos avanzado por un evento tardío. Si hay lag material, la API puede
declarar freshness degradada sin inventar estados.

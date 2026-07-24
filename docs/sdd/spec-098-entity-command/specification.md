# Especificación — SPEC-098 Command

Command es una TicketLine autoritativa de KitchenTicket (SPEC-086), no sinónimo ni segundo
agregado. Existe uno por OrderItem allocation + station routing revision y su ID permanece estable
durante el ciclo de vida.

Estados únicos: `RECEIVED | CLAIMED | IN_PROGRESS | ON_HOLD | READY | COMPLETED | CANCELLED`.
READY significa producción terminada; COMPLETED confirma retiro/handoff por expediter. Los errores
técnicos no son estado: quedan como attempt/error y retry; un fallo de negocio termina CANCELLED.

Payload usa union discriminada allowlisted por `commandType + schemaVersion`, con tamaño máximo y
campos tipados. No admite blobs, PII, precios ni notas libres fuera del campo sanitizado permitido.
Toda transición usa expected revision, idempotency key, actor y timestamp del servidor.

Cada Command hereda `tenantId`, `brandId`, `branchId`, `visitId`, `orderId`, `orderItemId`,
`allocationId`, `stationId` y `routingPolicyRevisionId`. Su identidad permanece estable durante
todo el ciclo de vida y representa exactamente una unidad lógica de trabajo culinario; no se recicla
para otra allocation ni se reusa al cambiar de station, caso que requiere transferencia auditada.

`READY` significa producción terminada y disponible para expediter/handoff. `COMPLETED` confirma el
retiro o handoff efectivo de cocina. Esa diferencia es normativa: un Command puede quedar `READY`
sin estar `COMPLETED`, y ninguna proyección debe colapsar ambos estados sin declararlo.

El payload discriminado contiene sólo campos tipados y aprobados para ese `commandType` y
`schemaVersion`: quantity operativa, modifier summary, safety flags, timing markers, station hints
y texto libre sólo dentro del campo sanitizado permitido. No admite blobs, JSON arbitrario,
adjuntos, PII, precios, datos fiscales ni notas libres fuera del contrato.

Errores técnicos se registran como attempts reintentables con metadata de causa y nunca modifican
el estado de negocio por sí solos. Si una política o condición operativa impide continuar, la
terminalidad de negocio se expresa como `CANCELLED` con `reasonCode` y auditoría. Un retry técnico
no crea un nuevo Command ni cambia su identidad.

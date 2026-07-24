# Objetivo — SPEC-066

## Propósito

Reservation representa un compromiso de capacidad en una Branch y ventana temporal. La
capacidad se gobierna mediante Hold/Allocation, no mediante TableStatus ni campos embebidos.

## Resultado esperado

### CAD-066-01 — Reservation conserva identidad de scope, ventana y políticas aplicadas

Reservation identifica scope, ventana semiabierta, partySize, source, Guest opcional y
revisiones de políticas aplicadas.

### CAD-066-02 — El lifecycle de Reservation es cerrado y explícito

El lifecycle completo distingue PENDING, CONFIRMED, EXPIRED, SEATED, CANCELLED, NO_SHOW y
COMPLETED con transiciones cerradas.

### CAD-066-03 — Confirm consume capacidad con revalidación atómica y concurrente

confirm convierte Hold en Allocation confirmada tras revalidar capacidad de forma atómica
y concurrente.

### CAD-066-04 — Las salidas terminales liberan capacidad exactamente una vez

cancel, expire y no-show liberan capacidad en la misma transacción y conservan
reason/historia.

### CAD-066-05 — Seating vincula una única Visit sin delegar autoridad en proyecciones

seat vincula una única Visit/Occupancy; Availability y TableStatus nunca autorizan la
mutación.

### CAD-066-06 — La aprobación exige evidencia temporal, concurrente y de privacidad

La aprobación exige fixtures de DST, capacity races, idempotencia, reconfirmación, PII
mínima y aislamiento.

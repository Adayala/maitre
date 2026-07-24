# Objetivo — SPEC-058

Definir la API de Check con snapshots y totales calculados por servidor, saldo exacto,
correcciones trazables y frontera fiscal explícita.

## Criterios de aceptación

### CAD-058-01 — La API de Check delimita rutas, comandos y precondiciones inequívocas

create/get y los cuatro comandos aprobados tienen rutas, schemas, permisos y
precondiciones inequívocos.

### CAD-058-02 — Las mutaciones de Check son idempotentes y revisadas por servidor

create y comandos son idempotentes, usan revisión y nunca aceptan totales calculados por
el cliente.

### CAD-058-03 — La respuesta expone el desglose monetario con política explícita

La respuesta reproduce MoneyPolicy y separa gross, descuentos, impuesto estimado, cargos,
tip, paid y balance.

### CAD-058-04 — Settlement y void validan dependencias sin efectos parciales

settlement y void validan Payments/Refunds ambiguos, saldo y ciclo de vida sin efectos
parciales.

### CAD-058-05 — Los ajustes preservan append-only y frontera fiscal separada

Ajustes son append-only, Invoice permanece downstream y la exposición de Payments está
redactada.

### CAD-058-06 — La aprobación exige evidencia monetaria, de RBAC y aislamiento

La aprobación exige fixtures monetarios, concurrencia, retry, RBAC, auditoría, outbox y
aislamiento.

# Objetivo — SPEC-006

## Propósito

Definir Table como recurso físico u operacional dentro de un Salon, con identidad local, capacidad y atributos de layout, manteniendo su estado de uso como proyección derivada y no como verdad almacenada en el agregado.

## Resultado esperado

1. Table pertenece exactamente a un Salon, una Branch y un Tenant coherentes entre sí.
2. El identificador visible de la mesa es único en el scope aprobado.
3. La capacidad y atributos físicos quedan explicitados sin mezclar reglas de reservas u ocupaciones.
4. El estado visible de la mesa se deriva con precedencia declarada desde otros dominios.
5. Los bloqueos administrativos y condiciones operativas se diferencian de estados transitorios de servicio.
6. El agregado conserva aislamiento, trazabilidad y coherencia de layout.

## Fuera de alcance I0

- motor de asignación automática de mesas;
- CRUD HTTP, definido por su spec API;
- algoritmo visual final de floor plan;
- persistir ocupación, pago o reserva como columnas de Table;
- pricing, billing o analytics por mesa.

## Criterios de aceptación

### CAD-006-01 — Table modela un recurso branch-scoped con identidad local

Table expone `id`, `tenantId`, `branchId`, `salonId`, `number` o identificador visible, `capacity`, `status` derivado y metadatos de layout aprobados. No existe fuera de un Salon y Branch coherentes.

### CAD-006-02 — El identificador visible es único en el scope aprobado

`number` o código visible se normaliza y es único al menos dentro del Salon; cualquier ampliación del scope de unicidad debe quedar explícita en el contrato.

### CAD-006-03 — Capacidad y atributos físicos son explícitos y validados

`capacity` debe ser positiva y los atributos físicos opcionales como forma, zona o accesibilidad tienen catálogos o semánticas aprobadas. No se aceptan blobs abiertos para esconder layout arbitrario.

### CAD-006-04 — El estado de la mesa es derivado y con precedencia declarada

`AVAILABLE`, `OCCUPIED`, `RESERVED`, `PAYING`, `CLEANING`, `BLOCKED` u otros estados aprobados se calculan desde ocupaciones, reservas y bloqueos con un orden de precedencia inequívoco. Table no guarda ese estado como truth persistida.

### CAD-006-05 — Los bloqueos administrativos se distinguen de estados transitorios

Un bloqueo explícito impide nuevas asignaciones aunque no exista ocupación. Los estados transitorios derivados de operación diaria no se editan manualmente dentro del agregado Table salvo en flujos aprobados.

### CAD-006-06 — Layout, aislamiento y consistencia same-tenant son obligatorios

Mover o redefinir una mesa conserva consistencia entre Tenant, Branch y Salon, exige autorización y deja trazabilidad. Los accesos cross-tenant fallan cerrado.

# Verificación — SPEC-012

## Criterios

### CAD-012-01 — Create/list bajo Salon verifican coherencia tenant/sucursal/salón y ocultan todo recurso de otro tenant como inexistente

- [ ] create/list validan coherencia tenant/sucursal/salón;
- [ ] recursos de otro tenant o inexistentes se ocultan;
- [ ] no se aceptan incoherencias de path/body.

### CAD-012-02 — Número normalizado es único por Salon; capacidad permanece entre 1 y 20 y la suma respeta el límite administrativo aprobado

- [ ] número se normaliza y es único por salón;
- [ ] `capacity` respeta rango aprobado;
- [ ] la suma de capacidades respeta límites administrativos cuando aplique.

### CAD-012-03 — Los cuerpos rechazan estado operativo derivado y cualquier intento de ocupar, bloquear, limpiar o reservar mediante este CRUD

- [ ] el cuerpo no acepta estados operativos derivados;
- [ ] la API rechaza intentos de ocupar, bloquear, limpiar o reservar por este CRUD;
- [ ] el contrato separa configuración de operación.

### CAD-012-04 — PATCH exige `If-Match`, no mueve una mesa entre salones y rechaza reducción o inactivación incompatible con asignación/ocupación activa

- [ ] `PATCH` exige `If-Match`;
- [ ] no permite mover una mesa entre salones por este flujo;
- [ ] cambios incompatibles con asignación/ocupación activa fallan explícitamente.

### CAD-012-05 — No existe eliminación física para mesas referenciadas; inactivación conserva IDs e historia

- [ ] no se borra físicamente una mesa referenciada;
- [ ] inactivación conserva identidad e historial;
- [ ] referencias existentes siguen siendo trazables.

### CAD-012-06 — Problem Details, permisos, auditoría y OpenAPI cubren unicidad, límites, concurrencia, rechazo de estado operativo y aislamiento

- [ ] OpenAPI refleja campos permitidos y prohibidos;
- [ ] Problem Details cubre unicidad, conflicto y rechazo de estado operativo;
- [ ] permisos, auditoría y aislamiento quedan cubiertos con pruebas enlazadas.

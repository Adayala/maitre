# Objetivo — SPEC-005

## Propósito

Salón es área física que contiene mesas. Agrupa recursos y facilita operación.

## Criterios de aceptación

### CAD-1: Crear salón

POST /branches/:id/salons con name, capacity.

### CAD-2: Mesas en salón

Salón puede tener múltiples mesas.

### CAD-3: API CRUD

CRUD /branches/:id/salons.

### CAD-4: Isolación

Salones aislados por tenant.

# Objetivo — SPEC-006

## Propósito

Mesa es recurso físico con número, capacidad, posición. Su estado se **deriva** de ocupaciones y reservas (no se almacena).

## Criterios de aceptación

### CAD-1: Crear mesa

POST /salons/:id/tables con number, capacity, x, y.

### CAD-2: Estado derivado

Estado de mesa es AVAILABLE | OCCUPIED | PAYING | CLEANING | BLOCKED (calculado desde ocupaciones).

### CAD-3: API CRUD

CRUD /salons/:id/tables.

### CAD-4: Isolación

Mesas aisladas por tenant.

# Objetivo — SPEC-004

## Propósito

Sucursal es la unidad operacional: contiene salones, mesas, activa servicios (Floor, Kitchen, etc), reportes por sucursal.

## Resultado esperado

1. ✅ Sucursal creada con nombre, dirección, horario
2. ✅ Sucursal pertenece a brand y tenant
3. ✅ Sucursal activa servicios (Floor, Kitchen, Cash, etc)
4. ✅ Sucursal hereda config de brand, puede sobrescribir
5. ✅ API CRUD: POST, GET, PATCH /branches
6. ✅ Aislación por tenant

## Criterios de aceptación

### CAD-1: Crear sucursal

POST /branches con name, brand, dirección → sucursal activa.

### CAD-2: Herencia de brand

Sucursal hereda menú y config de brand.

### CAD-3: Servicios activos

Sucursal especifica qué servicios tiene (via entitlements de subscription).

### CAD-4: API CRUD

POST, GET, PATCH /branches.

### CAD-5: Isolación

Sucursales de tenant A no visibles para tenant B.

## User stories

Como gerente
Quiero crear una sucursal nueva en Belgrano
Para empezar a operar desde ese local.

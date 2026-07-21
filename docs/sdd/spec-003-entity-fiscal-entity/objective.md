# Objetivo — SPEC-003

## Propósito

Entidad fiscal es la persona o empresa que emite comprobantes (facturas, recibos). Contiene CUIT, condición tributaria, certificados ARCA. Un tenant puede tener múltiples entidades fiscales.

## Resultado esperado

1. ✅ Entidad fiscal creada con CUIT, condición tributaria
2. ✅ Certificados ARCA almacenados y validados
3. ✅ Puntos de venta registrados por entidad fiscal
4. ✅ API CRUD: POST, GET, PATCH /fiscal-entities
5. ✅ Aislación por tenant

## Criterios de aceptación

### CAD-1: Crear entidad fiscal

CUIT único por tenant, validar CUIT checksum.

### CAD-2: Certificados ARCA

Almacenar certificado X.509, clave privada (cifrada).

### CAD-3: Puntos de venta

Cada entidad fiscal puede tener múltiples PV (numeraciones ARCA).

### CAD-4: API CRUD

POST /fiscal-entities, GET, PATCH.

### CAD-5: Isolación

Datos de entidad fiscal aislados por tenant.

## User stories

Como contador/admin
Quiero registrar la entidad fiscal que emite comprobantes
Para poder facturar correctamente en ARCA.

## Success metrics

- Creación de entidad fiscal: < 100ms
- Validación CUIT: 99.9%
- Almacenamiento de certificados seguro (cifrado)

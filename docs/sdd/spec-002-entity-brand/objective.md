# Objetivo — SPEC-002

## Propósito

Definir Brand como identidad comercial con alcance tenant para agrupar sucursales bajo una misma marca, compartiendo defaults aprobados sin convertir la entidad en un contenedor genérico de configuración o capacidades.

## Resultado esperado

1. Brand pertenece exactamente a un Tenant.
2. `slug` y `code` público derivado son únicos dentro del Tenant.
3. Los defaults de marca son explícitos, acotados y overrideables por sucursal donde corresponda.
4. Menu, fiscalidad, entitlements y configuración abierta no se embeben en Brand.
5. El ciclo de vida comercial distingue activo, inactivo y archivado.
6. La creación y cambios publican eventos y auditoría sin romper el aislamiento entre tenants.

## Fuera de alcance I0

- CRUD HTTP, definido por la spec API correspondiente;
- herencia automática no acotada vía `config` JSON abierto;
- copiar menús completos dentro de Brand;
- resolver permisos por conocer `brandId`;
- administrar límites, billing o feature flags.

## Criterios de aceptación

### CAD-002-01 — Brand modela identidad comercial con alcance tenant

Brand expone `id`, `tenantId`, `name`, `slug`, `status`, descripción y assets de marca opcionales. No existe Brand sin Tenant ni Tenant compartido implícito.

### CAD-002-02 — `slug` es estable, normalizado y único dentro del Tenant

`slug` se genera o valida con normalización determinística, no es único global y no colisiona dentro del mismo Tenant. La mutación de nombre no obliga a reutilizar slugs ambiguos ni a perder trazabilidad.

### CAD-002-03 — Los defaults de marca son explícitos y acotados

Brand sólo define defaults aprobados para branding y operación comercial liviana, por ejemplo voz, políticas descriptivas o referencias default. No admite un `config` libre que oculte decisiones de dominio.

### CAD-002-04 — Brand no absorbe menús, fiscalidad ni capacidades

Brand puede referenciar otros agregados aprobados, pero no embebe menú completo, certificados fiscales, límites, cuotas, feature flags ni entitlements efectivos.

### CAD-002-05 — El ciclo de vida comercial es consistente y restrictivo al archivar

Los únicos estados válidos son `ACTIVE`, `INACTIVE` y `ARCHIVED`. `ARCHIVED` impide cambios operativos nuevos y preserva lectura histórica autorizada.

### CAD-002-06 — Cambios en Brand conservan aislamiento, auditoría y publicación de eventos

Toda creación o mutación autorizada mantiene alcance por `tenantId`, registra auditoría y publica `BrandCreated` o eventos equivalentes mediante outbox sin exponer datos de otro tenant.

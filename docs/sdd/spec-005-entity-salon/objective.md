# Objetivo — SPEC-005

## Propósito

Definir Salon como agrupador espacial u operativo dentro de una Branch, con identidad estable, reglas de capacidad y orden suficiente para soportar mesas, layout y operación local sin mezclar estado dinámico de ocupación.

## Resultado esperado

1. Salon pertenece exactamente a una Branch del mismo Tenant.
2. El nombre y/o código del salón son únicos en el scope aprobado de la sucursal.
3. La capacidad declarada del salón tiene semántica explícita y no contradice la de sus mesas.
4. Layout y orden visual se modelan sin derivar estado operativo desde Salon.
5. Table depende de Salon para ubicación, no para autorización independiente del alcance de sucursal.
6. La entidad conserva aislamiento tenant-scoped y lifecycle simple.

## Fuera de alcance I0

- estado de ocupación en tiempo real del salón;
- CRUD HTTP, definido por su spec API;
- asignación de staff, turnos o secciones comerciales;
- renderizado del plano visual final;
- cálculos financieros o de performance por salón.

## Criterios de aceptación

### CAD-005-01 — Salon modela un área branch-scoped

Salon expone `id`, `tenantId`, `branchId`, `name`, `status` y metadatos de descripción u orden aprobados. No existe fuera de una Branch ni como concepto global del Tenant.

### CAD-005-02 — La identidad del salón es estable y única en su sucursal

`name` y/o `code` se validan y normalizan según la política aprobada. No puede haber dos salones ambiguos dentro de la misma Branch.

### CAD-005-03 — La capacidad del salón tiene semántica explícita

Si `capacity` existe, representa un límite operativo o referencia declarativa aprobada. No reemplaza la capacidad de las mesas ni se usa como fuente implícita de truth sin reglas.

### CAD-005-04 — Salon organiza layout sin absorber estado dinámico

Salon puede ordenar, agrupar o describir mesas, pero no persiste estados derivados como ocupación, pago o limpieza agregada.

### CAD-005-05 — Table depende de Salon con consistencia same-tenant

Toda Table referencia un Salon y Branch del mismo Tenant. Mover una mesa entre salones respeta autorización, concurrencia y trazabilidad.

### CAD-005-06 — Lifecycle y aislamiento del salón son consistentes

Los únicos estados válidos se limitan al set aprobado para habilitar o deshabilitar el uso del salón. El acceso cross-tenant o cross-branch no autorizado falla cerrado.

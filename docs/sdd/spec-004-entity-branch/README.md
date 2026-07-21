# [SPEC-004] Branch Entity

Sucursal física y operacional de un restaurante. Unidad de operación, facturación y reportes.

## Metadata

| Campo | Valor |
| --- | --- |
| **ID** | SPEC-004 |
| **Título** | Branch Entity |
| **Tipo** | Entity |
| **Dominio** | Organization |
| **Status** | PLANNED |
| **Prioridad** | P0 |
| **Fase** | 1 |
| **Estimación** | 8h |

## Overview

Una sucursal es la unidad operacional de un restaurante. Puede:
- Pertenece a una marca y un tenant
- Tiene dirección, teléfono, horario
- Contiene salones y mesas
- Puede heredar menú de marca o tener el propio
- Activa servicios (Floor, Kitchen, Cash, etc)

## Related Specs

**Dependencias:** [SPEC-001] Tenant, [SPEC-002] Brand, [SPEC-003] FiscalEntity ✅

**Dependientes:** [SPEC-005] Salon, [SPEC-010] Branches API, [SPEC-015] BranchCreated Event

**Status: PLANNED**
